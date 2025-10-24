"""
Order CRUD API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Order
from app.schemas import (
    OrderCreate,
    OrderResponse,
    OrderList,
    OrderUpdate,
    BulkUpdateRequest,
    BulkUpdateResponse,
    BulkDeleteRequest,
    BulkDeleteResponse
)
from app.utils.auth import get_current_user_id
import logging
import csv
import io
import json
from datetime import date, datetime
from decimal import Decimal

logger = logging.getLogger(__name__)
router = APIRouter()


class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle Decimal types"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(
    order: OrderCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new order for the authenticated user
    """
    try:
        # Create new order
        db_order = Order(
            user_id=user_id,
            **order.model_dump()
        )

        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        logger.info(f"Created order {db_order.id} for user {user_id}")
        return db_order

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@router.get("", response_model=OrderList)
def list_orders(
    page: int = 1,
    page_size: int = 50,
    status: Optional[str] = None,
    store: Optional[str] = None,
    search: Optional[str] = None,
    order_date_from: Optional[str] = None,
    order_date_to: Optional[str] = None,
    release_date_from: Optional[str] = None,
    release_date_to: Optional[str] = None,
    amount_owing_only: Optional[bool] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List orders for the authenticated user with pagination, filtering, and sorting

    Query Parameters:
    - status: Filter by status (Pending, Delivered, Sold)
    - store: Filter by store name
    - search: Search in product_name, store_name, notes
    - order_date_from/to: Filter by order date range
    - release_date_from/to: Filter by release date range
    - amount_owing_only: Show only orders with amount owing > 0
    - sort_by: Field to sort by (created_at, order_date, product_name, total_cost, etc.)
    - sort_order: Sort order (asc, desc)
    """
    try:
        # Base query - CRITICAL: Filter by user_id for row-level security
        query = db.query(Order).filter(Order.user_id == user_id)

        # Apply filters
        if status:
            query = query.filter(Order.status == status)

        if store:
            query = query.filter(Order.store_name.ilike(f"%{store}%"))

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Order.product_name.ilike(search_pattern)) |
                (Order.store_name.ilike(search_pattern)) |
                (Order.notes.ilike(search_pattern))
            )

        # Date range filters
        if order_date_from:
            query = query.filter(Order.order_date >= order_date_from)
        if order_date_to:
            query = query.filter(Order.order_date <= order_date_to)
        if release_date_from:
            query = query.filter(Order.release_date >= release_date_from)
        if release_date_to:
            query = query.filter(Order.release_date <= release_date_to)

        # Amount owing filter (using computed column)
        if amount_owing_only:
            query = query.filter(Order.amount_owing > 0)

        # Get total count before sorting
        total = query.count()

        # Apply sorting
        valid_sort_fields = {
            "created_at": Order.created_at,
            "order_date": Order.order_date,
            "release_date": Order.release_date,
            "product_name": Order.product_name,
            "store_name": Order.store_name,
            "quantity": Order.quantity,
            "cost_per_item": Order.cost_per_item,
            "total_cost": Order.total_cost,
            "amount_paid": Order.amount_paid,
            "amount_owing": Order.amount_owing,
            "status": Order.status,
        }

        sort_field = valid_sort_fields.get(sort_by, Order.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())

        # Apply pagination
        offset = (page - 1) * page_size
        orders = query.offset(offset).limit(page_size).all()

        logger.info(f"Retrieved {len(orders)} orders for user {user_id} (total: {total})")

        return OrderList(
            orders=orders,
            total=total,
            page=page,
            page_size=page_size
        )

    except Exception as e:
        logger.error(f"Error listing orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list orders: {str(e)}")


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get a single order by ID
    """
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user_id  # Row-level security
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: str,
    order_update: OrderUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update a order by ID
    """
    try:
        # Find order with row-level security check
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Update only provided fields
        update_data = order_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(order, field, value)

        # Validate amount_paid doesn't exceed total_cost after update
        # Total cost is computed by database, so we need to calculate it here
        quantity = order.quantity
        cost_per_item = order.cost_per_item
        amount_paid = order.amount_paid
        total_cost = quantity * cost_per_item

        if amount_paid > total_cost:
            raise HTTPException(
                status_code=400,
                detail=f"Amount paid (${amount_paid}) cannot exceed total cost (${total_cost})"
            )

        db.commit()
        db.refresh(order)

        logger.info(f"Updated order {order_id} for user {user_id}")
        return order

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update order: {str(e)}")


@router.delete("/{order_id}", status_code=204)
def delete_order(
    order_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a order by ID
    """
    try:
        # Find order with row-level security check
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        db.delete(order)
        db.commit()

        logger.info(f"Deleted order {order_id} for user {user_id}")
        return None

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete order: {str(e)}")


@router.get("/stores", response_model=list[str])
def get_store_names(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get unique store names from user's orders
    Returns a list of unique store names used by the user
    """
    try:
        # Query unique store names for the user
        store_names = db.query(Order.store_name).filter(
            Order.user_id == user_id
        ).distinct().all()

        # Extract store names from tuples and sort
        stores = sorted([name[0] for name in store_names if name[0]])

        logger.info(f"Retrieved {len(stores)} unique store names for user {user_id}")
        return stores

    except Exception as e:
        logger.error(f"Error fetching store names: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch store names: {str(e)}")


@router.post("/bulk-update", response_model=BulkUpdateResponse)
def bulk_update_orders(
    request: BulkUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Bulk update multiple orders at once

    Only updates orders that belong to the authenticated user.
    Returns count of successful updates and list of failed IDs.
    """
    try:
        updated_count = 0
        failed_ids = []

        # Get update data (only non-None fields)
        update_data = request.update_data.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")

        for order_id in request.order_ids:
            try:
                # Find order with row-level security check
                order = db.query(Order).filter(
                    Order.id == order_id,
                    Order.user_id == user_id
                ).first()

                if order:
                    # Update fields
                    for field, value in update_data.items():
                        setattr(order, field, value)
                    updated_count += 1
                else:
                    failed_ids.append(order_id)

            except Exception as e:
                logger.error(f"Error updating order {order_id}: {str(e)}")
                failed_ids.append(order_id)

        db.commit()

        logger.info(f"Bulk updated {updated_count} orders for user {user_id}")

        return BulkUpdateResponse(
            updated_count=updated_count,
            failed_ids=failed_ids,
            message=f"Successfully updated {updated_count} order(s)"
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in bulk update: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to bulk update: {str(e)}")


@router.post("/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_orders(
    request: BulkDeleteRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Bulk delete multiple orders at once

    Only deletes orders that belong to the authenticated user.
    Returns count of successful deletions and list of failed IDs.
    """
    try:
        deleted_count = 0
        failed_ids = []

        for order_id in request.order_ids:
            try:
                # Find order with row-level security check
                order = db.query(Order).filter(
                    Order.id == order_id,
                    Order.user_id == user_id
                ).first()

                if order:
                    db.delete(order)
                    deleted_count += 1
                else:
                    failed_ids.append(order_id)

            except Exception as e:
                logger.error(f"Error deleting order {order_id}: {str(e)}")
                failed_ids.append(order_id)

        db.commit()

        logger.info(f"Bulk deleted {deleted_count} orders for user {user_id}")

        return BulkDeleteResponse(
            deleted_count=deleted_count,
            failed_ids=failed_ids,
            message=f"Successfully deleted {deleted_count} order(s)"
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in bulk delete: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to bulk delete: {str(e)}")


@router.get("/export")
def export_orders(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Export all orders to CSV format

    Returns a CSV file with all order data including computed columns.
    """
    try:
        # Get all orders for the user
        orders = db.query(Order).filter(Order.user_id == user_id).all()

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            "id", "product_name", "product_url", "quantity", "store_name",
            "cost_per_item", "amount_paid", "sold_price", "status",
            "release_date", "order_date", "notes",
            "total_cost", "amount_owing", "profit", "profit_margin",
            "created_at", "updated_at"
        ])

        # Write data
        for p in orders:
            writer.writerow([
                p.id,
                p.product_name,
                p.product_url or "",
                p.quantity,
                p.store_name,
                float(p.cost_per_item),
                float(p.amount_paid),
                float(p.sold_price) if p.sold_price else "",
                p.status,
                p.release_date.isoformat() if p.release_date else "",
                p.order_date.isoformat(),
                p.notes or "",
                float(p.total_cost) if p.total_cost else "",
                float(p.amount_owing) if p.amount_owing else "",
                float(p.profit) if p.profit else "",
                float(p.profit_margin) if p.profit_margin else "",
                p.created_at.isoformat(),
                p.updated_at.isoformat()
            ])

        # Create streaming response
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=orders_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )

    except Exception as e:
        logger.error(f"Error exporting orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export orders: {str(e)}")


@router.post("/import")
async def import_orders(
    file: UploadFile = File(...),
    duplicate_handling: str = "skip",  # skip, update, or add
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Import orders from CSV file

    Duplicate handling options:
    - skip: Skip rows with matching product_name + store_name + order_date
    - update: Update existing orders
    - add: Always add as new orders (ignore duplicates)

    Returns count of imported, skipped, and failed rows.
    """
    try:
        # Read CSV file
        contents = await file.read()
        csv_data = io.StringIO(contents.decode("utf-8"))
        reader = csv.DictReader(csv_data)

        imported_count = 0
        skipped_count = 0
        failed_count = 0
        errors = []

        for row_num, row in enumerate(reader, start=2):  # Start at 2 (1 is header)
            try:
                # Check for duplicates if needed
                if duplicate_handling in ["skip", "update"]:
                    existing = db.query(Order).filter(
                        Order.user_id == user_id,
                        Order.product_name == row["product_name"],
                        Order.store_name == row["store_name"],
                        Order.order_date == row["order_date"]
                    ).first()

                    if existing:
                        if duplicate_handling == "skip":
                            skipped_count += 1
                            continue
                        elif duplicate_handling == "update":
                            # Update existing order
                            existing.quantity = int(row["quantity"])
                            existing.cost_per_item = Decimal(row["cost_per_item"])
                            existing.amount_paid = Decimal(row["amount_paid"]) if row["amount_paid"] else Decimal(0)
                            existing.sold_price = Decimal(row["sold_price"]) if row.get("sold_price") else None
                            existing.status = row["status"]
                            existing.product_url = row.get("product_url") or None
                            existing.release_date = datetime.fromisoformat(row["release_date"]).date() if row.get("release_date") else None
                            existing.notes = row.get("notes") or None
                            imported_count += 1
                            continue

                # Create new order
                order = Order(
                    user_id=user_id,
                    product_name=row["product_name"],
                    product_url=row.get("product_url") or None,
                    quantity=int(row["quantity"]),
                    store_name=row["store_name"],
                    cost_per_item=Decimal(row["cost_per_item"]),
                    amount_paid=Decimal(row["amount_paid"]) if row["amount_paid"] else Decimal(0),
                    sold_price=Decimal(row["sold_price"]) if row.get("sold_price") else None,
                    status=row["status"],
                    release_date=datetime.fromisoformat(row["release_date"]).date() if row.get("release_date") else None,
                    order_date=datetime.fromisoformat(row["order_date"]).date() if row.get("order_date") else date.today(),
                    notes=row.get("notes") or None
                )

                db.add(order)
                imported_count += 1

            except Exception as e:
                failed_count += 1
                errors.append(f"Row {row_num}: {str(e)}")
                logger.error(f"Error importing row {row_num}: {str(e)}")

        db.commit()

        logger.info(f"Imported {imported_count} orders for user {user_id}")

        return {
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "failed_count": failed_count,
            "errors": errors[:10]  # Return first 10 errors only
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error importing CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to import CSV: {str(e)}")


@router.get("/backup")
def backup_orders(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a JSON backup of all orders

    Returns a JSON file containing all order data for backup purposes.
    """
    try:
        # Get all orders for the user
        orders = db.query(Order).filter(Order.user_id == user_id).all()

        # Convert to dict
        backup_data = {
            "backup_date": datetime.now().isoformat(),
            "user_id": user_id,
            "total_orders": len(orders),
            "orders": [
                {
                    "id": p.id,
                    "product_name": p.product_name,
                    "product_url": p.product_url,
                    "quantity": p.quantity,
                    "store_name": p.store_name,
                    "cost_per_item": p.cost_per_item,
                    "amount_paid": p.amount_paid,
                    "sold_price": p.sold_price,
                    "status": p.status,
                    "release_date": p.release_date,
                    "order_date": p.order_date,
                    "notes": p.notes,
                    "created_at": p.created_at,
                    "updated_at": p.updated_at
                }
                for p in orders
            ]
        }

        # Create JSON string with custom encoder
        json_str = json.dumps(backup_data, cls=DecimalEncoder, indent=2)

        # Return as downloadable file
        return StreamingResponse(
            iter([json_str]),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=orders_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            }
        )

    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create backup: {str(e)}")


@router.post("/restore")
async def restore_orders(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Restore orders from JSON backup file

    WARNING: This will delete all existing orders and replace them with the backup data.
    """
    try:
        # Read JSON file
        contents = await file.read()
        backup_data = json.loads(contents.decode("utf-8"))

        # Validate backup structure
        if "orders" not in backup_data:
            raise HTTPException(status_code=400, detail="Invalid backup file format")

        # Delete all existing orders for the user
        db.query(Order).filter(Order.user_id == user_id).delete()

        # Restore orders from backup
        restored_count = 0
        failed_count = 0
        errors = []

        for item in backup_data["orders"]:
            try:
                order = Order(
                    user_id=user_id,  # Always use current user_id
                    product_name=item["product_name"],
                    product_url=item.get("product_url"),
                    quantity=item["quantity"],
                    store_name=item["store_name"],
                    cost_per_item=Decimal(str(item["cost_per_item"])),
                    amount_paid=Decimal(str(item["amount_paid"])) if item.get("amount_paid") else Decimal(0),
                    sold_price=Decimal(str(item["sold_price"])) if item.get("sold_price") else None,
                    status=item["status"],
                    release_date=datetime.fromisoformat(item["release_date"]).date() if item.get("release_date") else None,
                    order_date=datetime.fromisoformat(item["order_date"]).date() if item.get("order_date") else date.today(),
                    notes=item.get("notes")
                )

                db.add(order)
                restored_count += 1

            except Exception as e:
                failed_count += 1
                errors.append(f"Failed to restore item '{item.get('product_name', 'unknown')}': {str(e)}")
                logger.error(f"Error restoring order: {str(e)}")

        db.commit()

        logger.info(f"Restored {restored_count} orders for user {user_id}")

        return {
            "restored_count": restored_count,
            "failed_count": failed_count,
            "errors": errors[:10],
            "message": f"Successfully restored {restored_count} order(s)"
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error restoring backup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to restore backup: {str(e)}")

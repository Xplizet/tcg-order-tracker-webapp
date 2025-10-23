"""
Preorder CRUD API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Preorder
from app.schemas import (
    PreorderCreate,
    PreorderResponse,
    PreorderList,
    PreorderUpdate,
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


@router.post("", response_model=PreorderResponse, status_code=201)
def create_preorder(
    preorder: PreorderCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new preorder for the authenticated user
    """
    try:
        # Create new preorder
        db_preorder = Preorder(
            user_id=user_id,
            **preorder.model_dump()
        )

        db.add(db_preorder)
        db.commit()
        db.refresh(db_preorder)

        logger.info(f"Created preorder {db_preorder.id} for user {user_id}")
        return db_preorder

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating preorder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create preorder: {str(e)}")


@router.get("", response_model=PreorderList)
def list_preorders(
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
    List preorders for the authenticated user with pagination, filtering, and sorting

    Query Parameters:
    - status: Filter by status (Pending, Delivered, Sold)
    - store: Filter by store name
    - search: Search in product_name, store_name, notes
    - order_date_from/to: Filter by order date range
    - release_date_from/to: Filter by release date range
    - amount_owing_only: Show only preorders with amount owing > 0
    - sort_by: Field to sort by (created_at, order_date, product_name, total_cost, etc.)
    - sort_order: Sort order (asc, desc)
    """
    try:
        # Base query - CRITICAL: Filter by user_id for row-level security
        query = db.query(Preorder).filter(Preorder.user_id == user_id)

        # Apply filters
        if status:
            query = query.filter(Preorder.status == status)

        if store:
            query = query.filter(Preorder.store_name == store)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Preorder.product_name.ilike(search_pattern)) |
                (Preorder.store_name.ilike(search_pattern)) |
                (Preorder.notes.ilike(search_pattern))
            )

        # Date range filters
        if order_date_from:
            query = query.filter(Preorder.order_date >= order_date_from)
        if order_date_to:
            query = query.filter(Preorder.order_date <= order_date_to)
        if release_date_from:
            query = query.filter(Preorder.release_date >= release_date_from)
        if release_date_to:
            query = query.filter(Preorder.release_date <= release_date_to)

        # Amount owing filter (using computed column)
        if amount_owing_only:
            query = query.filter(Preorder.amount_owing > 0)

        # Get total count before sorting
        total = query.count()

        # Apply sorting
        valid_sort_fields = {
            "created_at": Preorder.created_at,
            "order_date": Preorder.order_date,
            "release_date": Preorder.release_date,
            "product_name": Preorder.product_name,
            "store_name": Preorder.store_name,
            "quantity": Preorder.quantity,
            "cost_per_item": Preorder.cost_per_item,
            "total_cost": Preorder.total_cost,
            "amount_paid": Preorder.amount_paid,
            "amount_owing": Preorder.amount_owing,
            "status": Preorder.status,
        }

        sort_field = valid_sort_fields.get(sort_by, Preorder.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())

        # Apply pagination
        offset = (page - 1) * page_size
        preorders = query.offset(offset).limit(page_size).all()

        logger.info(f"Retrieved {len(preorders)} preorders for user {user_id} (total: {total})")

        return PreorderList(
            preorders=preorders,
            total=total,
            page=page,
            page_size=page_size
        )

    except Exception as e:
        logger.error(f"Error listing preorders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list preorders: {str(e)}")


@router.get("/{preorder_id}", response_model=PreorderResponse)
def get_preorder(
    preorder_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get a single preorder by ID
    """
    preorder = db.query(Preorder).filter(
        Preorder.id == preorder_id,
        Preorder.user_id == user_id  # Row-level security
    ).first()

    if not preorder:
        raise HTTPException(status_code=404, detail="Preorder not found")

    return preorder


@router.put("/{preorder_id}", response_model=PreorderResponse)
def update_preorder(
    preorder_id: str,
    preorder_update: PreorderUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update a preorder by ID
    """
    try:
        # Find preorder with row-level security check
        preorder = db.query(Preorder).filter(
            Preorder.id == preorder_id,
            Preorder.user_id == user_id
        ).first()

        if not preorder:
            raise HTTPException(status_code=404, detail="Preorder not found")

        # Update only provided fields
        update_data = preorder_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(preorder, field, value)

        db.commit()
        db.refresh(preorder)

        logger.info(f"Updated preorder {preorder_id} for user {user_id}")
        return preorder

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating preorder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update preorder: {str(e)}")


@router.delete("/{preorder_id}", status_code=204)
def delete_preorder(
    preorder_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a preorder by ID
    """
    try:
        # Find preorder with row-level security check
        preorder = db.query(Preorder).filter(
            Preorder.id == preorder_id,
            Preorder.user_id == user_id
        ).first()

        if not preorder:
            raise HTTPException(status_code=404, detail="Preorder not found")

        db.delete(preorder)
        db.commit()

        logger.info(f"Deleted preorder {preorder_id} for user {user_id}")
        return None

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting preorder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete preorder: {str(e)}")


@router.post("/bulk-update", response_model=BulkUpdateResponse)
def bulk_update_preorders(
    request: BulkUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Bulk update multiple preorders at once

    Only updates preorders that belong to the authenticated user.
    Returns count of successful updates and list of failed IDs.
    """
    try:
        updated_count = 0
        failed_ids = []

        # Get update data (only non-None fields)
        update_data = request.update_data.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")

        for preorder_id in request.preorder_ids:
            try:
                # Find preorder with row-level security check
                preorder = db.query(Preorder).filter(
                    Preorder.id == preorder_id,
                    Preorder.user_id == user_id
                ).first()

                if preorder:
                    # Update fields
                    for field, value in update_data.items():
                        setattr(preorder, field, value)
                    updated_count += 1
                else:
                    failed_ids.append(preorder_id)

            except Exception as e:
                logger.error(f"Error updating preorder {preorder_id}: {str(e)}")
                failed_ids.append(preorder_id)

        db.commit()

        logger.info(f"Bulk updated {updated_count} preorders for user {user_id}")

        return BulkUpdateResponse(
            updated_count=updated_count,
            failed_ids=failed_ids,
            message=f"Successfully updated {updated_count} preorder(s)"
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in bulk update: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to bulk update: {str(e)}")


@router.post("/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_preorders(
    request: BulkDeleteRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Bulk delete multiple preorders at once

    Only deletes preorders that belong to the authenticated user.
    Returns count of successful deletions and list of failed IDs.
    """
    try:
        deleted_count = 0
        failed_ids = []

        for preorder_id in request.preorder_ids:
            try:
                # Find preorder with row-level security check
                preorder = db.query(Preorder).filter(
                    Preorder.id == preorder_id,
                    Preorder.user_id == user_id
                ).first()

                if preorder:
                    db.delete(preorder)
                    deleted_count += 1
                else:
                    failed_ids.append(preorder_id)

            except Exception as e:
                logger.error(f"Error deleting preorder {preorder_id}: {str(e)}")
                failed_ids.append(preorder_id)

        db.commit()

        logger.info(f"Bulk deleted {deleted_count} preorders for user {user_id}")

        return BulkDeleteResponse(
            deleted_count=deleted_count,
            failed_ids=failed_ids,
            message=f"Successfully deleted {deleted_count} preorder(s)"
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in bulk delete: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to bulk delete: {str(e)}")


@router.get("/export")
def export_preorders(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Export all preorders to CSV format

    Returns a CSV file with all preorder data including computed columns.
    """
    try:
        # Get all preorders for the user
        preorders = db.query(Preorder).filter(Preorder.user_id == user_id).all()

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
        for p in preorders:
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
                "Content-Disposition": f"attachment; filename=preorders_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )

    except Exception as e:
        logger.error(f"Error exporting preorders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export preorders: {str(e)}")


@router.post("/import")
async def import_preorders(
    file: UploadFile = File(...),
    duplicate_handling: str = "skip",  # skip, update, or add
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Import preorders from CSV file

    Duplicate handling options:
    - skip: Skip rows with matching product_name + store_name + order_date
    - update: Update existing preorders
    - add: Always add as new preorders (ignore duplicates)

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
                    existing = db.query(Preorder).filter(
                        Preorder.user_id == user_id,
                        Preorder.product_name == row["product_name"],
                        Preorder.store_name == row["store_name"],
                        Preorder.order_date == row["order_date"]
                    ).first()

                    if existing:
                        if duplicate_handling == "skip":
                            skipped_count += 1
                            continue
                        elif duplicate_handling == "update":
                            # Update existing preorder
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

                # Create new preorder
                preorder = Preorder(
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

                db.add(preorder)
                imported_count += 1

            except Exception as e:
                failed_count += 1
                errors.append(f"Row {row_num}: {str(e)}")
                logger.error(f"Error importing row {row_num}: {str(e)}")

        db.commit()

        logger.info(f"Imported {imported_count} preorders for user {user_id}")

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
def backup_preorders(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a JSON backup of all preorders

    Returns a JSON file containing all preorder data for backup purposes.
    """
    try:
        # Get all preorders for the user
        preorders = db.query(Preorder).filter(Preorder.user_id == user_id).all()

        # Convert to dict
        backup_data = {
            "backup_date": datetime.now().isoformat(),
            "user_id": user_id,
            "total_preorders": len(preorders),
            "preorders": [
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
                for p in preorders
            ]
        }

        # Create JSON string with custom encoder
        json_str = json.dumps(backup_data, cls=DecimalEncoder, indent=2)

        # Return as downloadable file
        return StreamingResponse(
            iter([json_str]),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=preorders_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            }
        )

    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create backup: {str(e)}")


@router.post("/restore")
async def restore_preorders(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Restore preorders from JSON backup file

    WARNING: This will delete all existing preorders and replace them with the backup data.
    """
    try:
        # Read JSON file
        contents = await file.read()
        backup_data = json.loads(contents.decode("utf-8"))

        # Validate backup structure
        if "preorders" not in backup_data:
            raise HTTPException(status_code=400, detail="Invalid backup file format")

        # Delete all existing preorders for the user
        db.query(Preorder).filter(Preorder.user_id == user_id).delete()

        # Restore preorders from backup
        restored_count = 0
        failed_count = 0
        errors = []

        for item in backup_data["preorders"]:
            try:
                preorder = Preorder(
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

                db.add(preorder)
                restored_count += 1

            except Exception as e:
                failed_count += 1
                errors.append(f"Failed to restore item '{item.get('product_name', 'unknown')}': {str(e)}")
                logger.error(f"Error restoring preorder: {str(e)}")

        db.commit()

        logger.info(f"Restored {restored_count} preorders for user {user_id}")

        return {
            "restored_count": restored_count,
            "failed_count": failed_count,
            "errors": errors[:10],
            "message": f"Successfully restored {restored_count} preorder(s)"
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error restoring backup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to restore backup: {str(e)}")

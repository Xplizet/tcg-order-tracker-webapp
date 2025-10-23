"""
Create system_settings table and initialize with default values
"""
from app.database import Base, engine, SessionLocal
from app.models import SystemSettings

# Create the system_settings table
print("Creating system_settings table...")
Base.metadata.create_all(bind=engine, tables=[SystemSettings.__table__])
print("Table created successfully!")

# Initialize with default settings
print("Initializing default system settings...")
db = SessionLocal()

# Check if settings already exist
existing_settings = db.query(SystemSettings).filter(SystemSettings.id == "global").first()

if not existing_settings:
    default_settings = SystemSettings(
        id="global",
        subscriptions_enabled=False,
        grandfather_date=None,
        free_tier_limit=None,  # null = unlimited
        basic_tier_limit=None,  # null = unlimited
        maintenance_mode=False,
        maintenance_message=None,
        extra_settings={}
    )
    db.add(default_settings)
    db.commit()
    print("✓ Default settings initialized")
else:
    print("✓ Settings already exist, skipping initialization")

db.close()
print("\n✅ System settings setup complete!")

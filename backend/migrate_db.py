#!/usr/bin/env python3
"""
Database Migration Script for Enhanced MirrorMe Data Collection
Adds new fields for political tilt analysis, emotional analysis, and platform-specific metadata
"""

from models import Base
from database import engine, get_db
from config import settings
from sqlalchemy import create_engine, text
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def run_migration():
    """Run database migration to add new enhanced fields."""

    print("🔄 Starting database migration for enhanced data collection...")

    # SQL commands to add new columns (SQLite compatible)
    migration_commands = [
        # Add enhanced content analysis fields
        "ALTER TABLE behavior_logs ADD COLUMN content TEXT;",
        "ALTER TABLE behavior_logs ADD COLUMN political_tilt VARCHAR;",
        "ALTER TABLE behavior_logs ADD COLUMN confidence JSON;",

        # Add platform-specific metadata fields
        "ALTER TABLE behavior_logs ADD COLUMN author VARCHAR;",
        "ALTER TABLE behavior_logs ADD COLUMN video_id VARCHAR;",
        "ALTER TABLE behavior_logs ADD COLUMN channel VARCHAR;",

        # Update existing sentiment column to ensure it exists
        "ALTER TABLE behavior_logs ADD COLUMN sentiment VARCHAR;",

        # Create indexes for better query performance
        "CREATE INDEX IF NOT EXISTS idx_behavior_logs_political_tilt ON behavior_logs(political_tilt);",
        "CREATE INDEX IF NOT EXISTS idx_behavior_logs_sentiment ON behavior_logs(sentiment);",
        "CREATE INDEX IF NOT EXISTS idx_behavior_logs_behavior_type ON behavior_logs(behavior_type);",
        "CREATE INDEX IF NOT EXISTS idx_behavior_logs_author ON behavior_logs(author);",
        "CREATE INDEX IF NOT EXISTS idx_behavior_logs_channel ON behavior_logs(channel);",
    ]

    try:
        with engine.connect() as connection:
            # Check existing columns first
            result = connection.execute(
                text("PRAGMA table_info(behavior_logs)"))
            existing_columns = [row[1] for row in result.fetchall()]

            # Only add columns that don't exist
            columns_to_add = [
                ("content", "TEXT"),
                ("political_tilt", "VARCHAR"),
                ("confidence", "JSON"),
                ("author", "VARCHAR"),
                ("video_id", "VARCHAR"),
                ("channel", "VARCHAR"),
                ("sentiment", "VARCHAR")
            ]

            for column_name, column_type in columns_to_add:
                if column_name not in existing_columns:
                    command = f"ALTER TABLE behavior_logs ADD COLUMN {column_name} {column_type};"
                    print(f"  Adding column: {column_name}")
                    connection.execute(text(command))
                    connection.commit()
                else:
                    print(f"  Column {column_name} already exists, skipping")

            # Create indexes
            index_commands = [
                "CREATE INDEX IF NOT EXISTS idx_behavior_logs_political_tilt ON behavior_logs(political_tilt);",
                "CREATE INDEX IF NOT EXISTS idx_behavior_logs_sentiment ON behavior_logs(sentiment);",
                "CREATE INDEX IF NOT EXISTS idx_behavior_logs_behavior_type ON behavior_logs(behavior_type);",
                "CREATE INDEX IF NOT EXISTS idx_behavior_logs_author ON behavior_logs(author);",
                "CREATE INDEX IF NOT EXISTS idx_behavior_logs_channel ON behavior_logs(channel);"
            ]

            for command in index_commands:
                print(f"  Creating index: {command.split()[5]}")
                connection.execute(text(command))
                connection.commit()

        print("✅ Database migration completed successfully!")
        print("\n🎯 New features enabled:")
        print("   - Political tilt analysis (left/right/neutral)")
        print("   - Enhanced emotional sentiment analysis")
        print("   - Twitter/X activity tracking with author info")
        print("   - Granular YouTube tracking with video and channel data")
        print("   - Content analysis with confidence scoring")
        print("   - Instagram API integration preparation")
        print("   - 👥 Digital Avatars - Top 5 personality versions!")
        print("   - Cross-platform behavior analysis")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

    return True


def verify_migration():
    """Verify that the migration was successful."""

    print("\n🔍 Verifying migration...")

    verification_queries = [
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'behavior_logs' AND column_name = 'political_tilt';",
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'behavior_logs' AND column_name = 'content';",
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'behavior_logs' AND column_name = 'author';",
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'behavior_logs' AND column_name = 'video_id';",
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'behavior_logs' AND column_name = 'channel';"
    ]

    try:
        with engine.connect() as connection:
            for query in verification_queries:
                result = connection.execute(text(query))
                if not result.fetchone():
                    print(f"❌ Column not found: {query}")
                    return False

        print("✅ All new columns verified successfully!")
        return True

    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False


if __name__ == "__main__":
    print("🪞 MirrorMe Enhanced Data Collection Migration")
    print("=" * 50)

    # Run migration
    if run_migration():
        # Verify migration
        if verify_migration():
            print("\n🎉 Migration completed successfully!")
            print("\n📈 Your MirrorMe installation now supports:")
            print("   • Advanced political sentiment tracking")
            print("   • Granular social media behavior analysis")
            print("   • Enhanced YouTube content analysis")
            print("   • Cross-platform personality profiling")
            print("\n🚀 Restart your backend server to use the new features!")
        else:
            print("\n⚠️  Migration completed but verification failed")
            sys.exit(1)
    else:
        print("\n💥 Migration failed!")
        sys.exit(1)

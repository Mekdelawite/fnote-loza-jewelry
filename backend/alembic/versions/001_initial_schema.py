"""Initial schema for Fnote Loza platform

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-23 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Admin Users
    op.create_table(
        'admin_users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), server_default='owner', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_admin_users_email', 'admin_users', ['email'], unique=True)

    # 2. Categories
    op.create_table(
        'categories',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('slug', sa.String(length=50), nullable=False),
        sa.Column('name_en', sa.String(length=100), nullable=False),
        sa.Column('name_am', sa.String(length=100), nullable=False),
        sa.Column('description_en', sa.Text(), nullable=True),
        sa.Column('description_am', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_categories_slug', 'categories', ['slug'], unique=True)

    # 3. Products
    op.create_table(
        'products',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('sku', sa.String(length=50), nullable=False),
        sa.Column('name_en', sa.String(length=255), nullable=False),
        sa.Column('name_am', sa.String(length=255), nullable=False),
        sa.Column('description_en', sa.Text(), nullable=False),
        sa.Column('description_am', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('material', sa.String(length=50), nullable=False),
        sa.Column('purity', sa.String(length=50), nullable=False),
        sa.Column('weight_grams', sa.Float(), nullable=True),
        sa.Column('dimensions', sa.String(length=100), nullable=True),
        sa.Column('purchase_cost', sa.Float(), nullable=False),
        sa.Column('selling_price', sa.Float(), nullable=False),
        sa.Column('price_on_request', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('stock_quantity', sa.Integer(), server_default='0', nullable=False),
        sa.Column('low_stock_threshold', sa.Integer(), server_default='2', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='available', nullable=False),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_products_sku', 'products', ['sku'], unique=True)
    op.create_index('ix_products_category', 'products', ['category'])
    op.create_index('ix_products_material', 'products', ['material'])

    # 4. Product Images
    op.create_table(
        'product_images',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('product_id', sa.String(length=36), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('alt_en', sa.String(length=255), nullable=True),
        sa.Column('alt_am', sa.String(length=255), nullable=True),
        sa.Column('is_primary', sa.Boolean(), server_default='false', nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Sales
    op.create_table(
        'sales',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('sale_reference', sa.String(length=50), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('total_cost', sa.Float(), nullable=False),
        sa.Column('discount', sa.Float(), server_default='0', nullable=False),
        sa.Column('payment_method', sa.String(length=50), nullable=False),
        sa.Column('payment_status', sa.String(length=50), server_default='completed', nullable=False),
        sa.Column('customer_name', sa.String(length=255), nullable=True),
        sa.Column('customer_phone', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('responsible_admin', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('reversed_at', sa.DateTime(), nullable=True),
        sa.Column('reversal_reason', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_sales_reference', 'sales', ['sale_reference'], unique=True)

    # 6. Sale Items
    op.create_table(
        'sale_items',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('sale_id', sa.String(length=36), nullable=False),
        sa.Column('product_id', sa.String(length=36), nullable=False),
        sa.Column('sku', sa.String(length=50), nullable=False),
        sa.Column('product_name_en', sa.String(length=255), nullable=False),
        sa.Column('product_name_am', sa.String(length=255), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('unit_cost', sa.Float(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['sale_id'], ['sales.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # 7. Inventory Movements
    op.create_table(
        'inventory_movements',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('product_id', sa.String(length=36), nullable=False),
        sa.Column('product_sku', sa.String(length=50), nullable=False),
        sa.Column('product_name', sa.String(length=255), nullable=False),
        sa.Column('change_quantity', sa.Integer(), nullable=False),
        sa.Column('previous_quantity', sa.Integer(), nullable=False),
        sa.Column('new_quantity', sa.Integer(), nullable=False),
        sa.Column('movement_type', sa.String(length=50), nullable=False),
        sa.Column('reference_id', sa.String(length=100), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('admin_name', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. Brand Settings
    op.create_table(
        'brand_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('brand_name_en', sa.String(length=100), nullable=False),
        sa.Column('brand_name_am', sa.String(length=100), nullable=False),
        sa.Column('tagline_en', sa.String(length=255), nullable=False),
        sa.Column('tagline_am', sa.String(length=255), nullable=False),
        sa.Column('founder_name_en', sa.String(length=255), nullable=False),
        sa.Column('founder_name_am', sa.String(length=255), nullable=False),
        sa.Column('founder_title_en', sa.String(length=255), nullable=False),
        sa.Column('founder_title_am', sa.String(length=255), nullable=False),
        sa.Column('founder_bio_en', sa.Text(), nullable=True),
        sa.Column('founder_bio_am', sa.Text(), nullable=True),
        sa.Column('founder_photo_url', sa.Text(), nullable=True),
        sa.Column('whatsapp_number', sa.String(length=50), nullable=False),
        sa.Column('phone_number', sa.String(length=50), nullable=False),
        sa.Column('address_en', sa.String(length=255), nullable=True),
        sa.Column('address_am', sa.String(length=255), nullable=True),
        sa.Column('gold_rate_21k_etb', sa.Float(), server_default='11200.0', nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('brand_settings')
    op.drop_table('inventory_movements')
    op.drop_table('sale_items')
    op.drop_table('sales')
    op.drop_table('product_images')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('admin_users')

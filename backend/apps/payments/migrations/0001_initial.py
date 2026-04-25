# Generated migration file - Django will auto-generate this
# This is a template for reference only
# Run: python manage.py makemigrations payments
# Then: python manage.py migrate

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('success', 'Success'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('transaction_type', models.CharField(choices=[('purchase', 'Purchase'), ('rental', 'Rental')], help_text='Whether this is a purchase or rental payment', max_length=20)),
                ('purchase_id', models.IntegerField(blank=True, null=True)),
                ('rental_id', models.IntegerField(blank=True, null=True)),
                ('reference', models.CharField(max_length=100, unique=True)),
                ('paystack_access_code', models.CharField(blank=True, max_length=255, null=True)),
                ('paystack_authorization_url', models.URLField(blank=True, null=True)),
                ('paystack_auth_code', models.CharField(blank=True, max_length=255, null=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='transactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['user', '-created_at'], name='payments_tr_user_id_created_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['reference'], name='payments_tr_referen_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['status'], name='payments_tr_status_idx'),
        ),
    ]

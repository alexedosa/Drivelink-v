from django.contrib import admin
from django.utils.html import format_html
from .models import Car, CarImage

class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="80" height="80" style="object-fit:cover"/>', obj.image.url)
        return "-"
    image_preview.short_description = 'Preview'

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'brand', 'category', 'daily_rate', 'purchase_price', 'stock', 'image_preview']
    list_filter = ['category', 'brand', 'is_active']
    search_fields = ['name', 'brand']
    inlines = [CarImageInline]
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.main_image:
            return format_html('<img src="{}" width="80" height="80" style="object-fit:cover"/>', obj.main_image.url)
        return "-"
    image_preview.short_description = 'Main Image'

@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'car', 'order', 'image_preview']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="80" height="80" style="object-fit:cover"/>', obj.image.url)
        return "-"
    image_preview.short_description = 'Preview'
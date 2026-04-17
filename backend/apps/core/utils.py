import uuid

def generate_reference(prefix='DRV'):
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
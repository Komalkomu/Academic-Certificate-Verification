import hashlib
import json
from django.utils import timezone
from .models import BlockchainBlock

GENESIS_PREVIOUS_HASH = "0" * 64

def canonical_json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)

def calculate_block_hash(index, timestamp, data, previous_hash):
    payload = {
        "index": index,
        "timestamp": timestamp.isoformat(),
        "data": data,
        "previous_hash": previous_hash,
    }
    return hashlib.sha256(canonical_json(payload).encode("utf-8")).hexdigest()

def ensure_genesis_block():
    if not BlockchainBlock.objects.exists():
        timestamp = timezone.now()
        data = {"message": "Genesis block"}
        block_hash = calculate_block_hash(0, timestamp, data, GENESIS_PREVIOUS_HASH)
        BlockchainBlock.objects.create(
            index=0,
            timestamp=timestamp,
            data=data,
            previous_hash=GENESIS_PREVIOUS_HASH,
            block_hash=block_hash,
        )

def add_certificate_block(certificate_id, certificate_hash, student_name):
    ensure_genesis_block()
    last_block = BlockchainBlock.objects.order_by("-index").first()
    index = last_block.index + 1
    timestamp = timezone.now()
    data = {
        "event": "CERTIFICATE_ISSUED",
        "certificate_id": certificate_id,
        "certificate_hash": certificate_hash,
        "student_name": student_name,
    }
    block_hash = calculate_block_hash(index, timestamp, data, last_block.block_hash)
    return BlockchainBlock.objects.create(
        index=index,
        timestamp=timestamp,
        data=data,
        previous_hash=last_block.block_hash,
        block_hash=block_hash,
    )

def verify_chain():
    blocks = list(BlockchainBlock.objects.order_by("index"))
    if not blocks:
        return {"valid": False, "message": "Ledger has no genesis block."}

    for expected_index, block in enumerate(blocks):
        if block.index != expected_index:
            return {"valid": False, "message": f"Missing or reordered block near index {expected_index}."}

        expected_previous = GENESIS_PREVIOUS_HASH if expected_index == 0 else blocks[expected_index - 1].block_hash
        if block.previous_hash != expected_previous:
            return {"valid": False, "message": f"Previous-hash mismatch at block {block.index}."}

        expected_hash = calculate_block_hash(
            block.index, block.timestamp, block.data, block.previous_hash
        )
        if block.block_hash != expected_hash:
            return {"valid": False, "message": f"Block hash mismatch at block {block.index}."}

    return {"valid": True, "message": "All blocks and hash links are valid.", "blocks_checked": len(blocks)}

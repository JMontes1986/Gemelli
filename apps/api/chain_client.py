import os
from web3 import Web3
from typing import Optional
RPC = os.getenv("WEB3_RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
CHAIN_ID = int(os.getenv("CHAIN_ID", "80002"))
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
ABI = [ { "inputs":[ { "internalType":"bytes32","name":"_hash","type":"bytes32" }, { "internalType":"uint8","name":"_action","type":"uint8" }, { "internalType":"bytes32","name":"_entityId","type":"bytes32" } ], "name":"record", "outputs":[], "stateMutability":"nonpayable", "type":"function" } ]
def record(hash_hex: str, action: int, entity_id_hex: str) -> Optional[str]:
    if not RPC or not CONTRACT_ADDRESS or not PRIVATE_KEY:
        return None
    w3 = Web3(Web3.HTTPProvider(RPC))
    acct = w3.eth.account.from_key(PRIVATE_KEY)
    contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=ABI)
    nonce = w3.eth.get_transaction_count(acct.address)
    tx = contract.functions.record(Web3.to_bytes(hexstr=hash_hex), action, Web3.to_bytes(hexstr=entity_id_hex)).build_transaction({
        "from": acct.address, "nonce": nonce, "chainId": CHAIN_ID, "gas": 200000,
        "maxFeePerGas": w3.to_wei('50','gwei'), "maxPriorityFeePerGas": w3.to_wei('2','gwei')
    })
    signed = acct.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return tx_hash.hex()

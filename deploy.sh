#!/bin/bash

# cargo build-bpf && solana program deploy target/deploy/solana_address_mapping.so
cargo build-sbf && solana program deploy target/deploy/solana_address_mapping.so

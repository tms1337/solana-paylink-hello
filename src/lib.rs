use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
    system_instruction,
    program::invoke,
    program_pack::Pack,
    program::invoke_signed,
    rent::Rent,
    sysvar::Sysvar,
};
use std::collections::HashMap;
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct AddressMapping {
    mapping: HashMap<String, Pubkey>,
    index: HashMap<Pubkey, String>,
}

impl AddressMapping {
    pub fn new() -> Self {
        Self {
            mapping: HashMap::new(),
            index: HashMap::new(),
        }
    }

    pub fn get_address(&self, key: &str) -> Option<&Pubkey> {
        self.mapping.get(key)
    }

    pub fn register_address(&mut self, key: String, address: Pubkey) -> Result<(), ProgramError> {
        if self.mapping.contains_key(&key) || self.index.contains_key(&address) {
            return Err(ProgramError::InvalidArgument);
        }
        self.mapping.insert(key.clone(), address);
        self.index.insert(address, key);
        Ok(())
    }

    pub fn generate_random_key() -> String {
        thread_rng()
            .sample_iter(&Alphanumeric)
            .take(10)
            .map(char::from)
            .collect()
    }
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    let caller = next_account_info(accounts_iter)?;

    if account.owner != program_id {
        msg!("Account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut mapping_data = AddressMapping::try_from_slice(&account.data.borrow())?;

    let command = std::str::from_utf8(&instruction_data[..10])
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match command {
        "get" => {
            let key = std::str::from_utf8(&instruction_data[10..20])
                .map_err(|_| ProgramError::InvalidInstructionData)?;
            if let Some(address) = mapping_data.get_address(key) {
                msg!("Address for key {}: {:?}", key, address);
            } else {
                msg!("No address found for key {}", key);
            }
        }
        "register" => {
            let random_key = AddressMapping::generate_random_key();
            mapping_data.register_address(random_key.clone(), *caller.key)?;
            msg!("Registered address for key {}: {:?}", random_key, caller.key);
        }
        _ => {
            msg!("Unknown command");
        }
    }

    mapping_data.serialize(&mut &mut account.data.borrow_mut()[..])?;
    Ok(())
}

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
};
use std::collections::HashMap;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct AddressMapping {
    mapping: HashMap<String, Pubkey>,
}

impl AddressMapping {
    pub fn new() -> Self {
        Self {
            mapping: HashMap::new(),
        }
    }

    pub fn get_address(&self, key: &str) -> Option<&Pubkey> {
        self.mapping.get(key)
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

    if account.owner != program_id {
        msg!("Account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mapping_data = &mut AddressMapping::try_from_slice(&account.data.borrow())?;
    let command: &[u8; 10] = instruction_data
        .get(..10)
        .ok_or(ProgramError::InvalidInstructionData)?
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    let command_str = std::str::from_utf8(command).map_err(|_| ProgramError::InvalidInstructionData)?;

    match command_str {
        "get" => {
            let key: &[u8; 10] = instruction_data
                .get(10..20)
                .ok_or(ProgramError::InvalidInstructionData)?
                .try_into()
                .map_err(|_| ProgramError::InvalidInstructionData)?;
            let key_str = std::str::from_utf8(key).map_err(|_| ProgramError::InvalidInstructionData)?;

            if let Some(address) = mapping_data.get_address(key_str) {
                msg!("Address for key {}: {:?}", key_str, address);
            } else {
                msg!("No address found for key {}", key_str);
            }
        }
        _ => {
            msg!("Unknown command");
        }
    }

    mapping_data.serialize(&mut &mut account.data.borrow_mut()[..])?;

    Ok(())
}

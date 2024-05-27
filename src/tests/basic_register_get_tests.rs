#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::clock::Epoch;
    use solana_program::pubkey::Pubkey;
    use solana_program::account_info::AccountInfo;
    use solana_program::program_pack::Pack;
    use solana_program::rent::Rent;
    use std::cell::RefCell;
    use std::collections::HashMap;

    fn create_account_info<'a>(key: &'a Pubkey, owner: &'a Pubkey, data_len: usize) -> AccountInfo<'a> {
        let mut data = vec![0u8; data_len];
        let lamports = Rent::default().minimum_balance(data_len);
        AccountInfo {
            key,
            is_signer: true,
            is_writable: true,
            lamports: RefCell::new(lamports),
            data: RefCell::new(data),
            owner,
            executable: false,
            rent_epoch: Epoch::default(),
        }
    }

    #[test]
    fn test_register_new_address() {
        let program_id = Pubkey::new_unique();
        let mut address_mapping = AddressMapping::new();
        let new_address = Pubkey::new_unique();
        let key = AddressMapping::generate_random_key();

        assert!(address_mapping.register_address(key.clone(), new_address).is_ok());
        assert_eq!(address_mapping.get_address(&key).unwrap(), &new_address);
    }

    #[test]
    fn test_register_existing_key() {
        let program_id = Pubkey::new_unique();
        let mut address_mapping = AddressMapping::new();
        let new_address = Pubkey::new_unique();
        let key = AddressMapping::generate_random_key();

        address_mapping.register_address(key.clone(), new_address).unwrap();
        assert!(address_mapping.register_address(key.clone(), new_address).is_err());
    }

    #[test]
    fn test_register_existing_address() {
        let program_id = Pubkey::new_unique();
        let mut address_mapping = AddressMapping::new();
        let new_address = Pubkey::new_unique();
        let key1 = AddressMapping::generate_random_key();
        let key2 = AddressMapping::generate_random_key();

        address_mapping.register_address(key1.clone(), new_address).unwrap();
        assert!(address_mapping.register_address(key2.clone(), new_address).is_err());
    }

    #[test]
    fn test_get_existing_address() {
        let program_id = Pubkey::new_unique();
        let mut address_mapping = AddressMapping::new();
        let new_address = Pubkey::new_unique();
        let key = AddressMapping::generate_random_key();

        address_mapping.register_address(key.clone(), new_address).unwrap();
        assert_eq!(address_mapping.get_address(&key).unwrap(), &new_address);
    }

    #[test]
    fn test_get_non_existent_address() {
        let program_id = Pubkey::new_unique();
        let address_mapping = AddressMapping::new();
        let key = AddressMapping::generate_random_key();

        assert!(address_mapping.get_address(&key).is_none());
    }

    #[test]
    fn test_process_instruction_register() {
        let program_id = Pubkey::new_unique();
        let mut address_mapping = AddressMapping::new();
        let account_key = Pubkey::new_unique();
        let account = create_account_info(&account_key, &program_id, 1024);
        let caller_key = Pubkey::new_unique();
        let caller = create_account_info(&caller_key, &program_id, 0);
        
        let instruction_data = b"register";
        let accounts = vec![account.clone(), caller.clone()];

        process_instruction(&program_id, &accounts, instruction_data).unwrap();

        let stored_mapping = AddressMapping::try_from_slice(&account.data.borrow()).unwrap();
        assert!(stored_mapping.index.contains_key(&caller_key));
    }

    #[test]
    fn test_process_instruction_get() {
        let program_id = Pubkey::new_unique();
        let mut address_mapping = AddressMapping::new();
        let account_key = Pubkey::new_unique();
        let account = create_account_info(&account_key, &program_id, 1024);

        let key = AddressMapping::generate_random_key();
        let address = Pubkey::new_unique();
        address_mapping.register_address(key.clone(), address).unwrap();
        address_mapping.serialize(&mut &mut account.data.borrow_mut()[..]).unwrap();

        let instruction_data = format!("get{}", key).as_bytes();
        let accounts = vec![account.clone()];

        process_instruction(&program_id, &accounts, instruction_data).unwrap();
    }

    #[test]
    fn test_process_instruction_invalid_command() {
        let program_id = Pubkey::new_unique();
        let account_key = Pubkey::new_unique();
        let account = create_account_info(&account_key, &program_id, 1024);

        let instruction_data = b"invalidcmd";
        let accounts = vec![account.clone()];

        let result = process_instruction(&program_id, &accounts, instruction_data);
        assert!(result.is_err());
    }
}

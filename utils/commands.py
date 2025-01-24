def zotify_command_builder(account: str, action: str, args: str) -> list:
    """Builds the Docker command for Zotify execution."""
    base_cmd = [
        'python3', '-m', 'zotify',
        '--credentials-location', f'./credentials/{account}/credentials.json'
    ]
    
    if action == 'download':
        return [*base_cmd, args]  # args is Spotify URL
    elif action == 'search':
        return [*base_cmd, '-s', args]  # args is search query
    raise ValueError(f"Invalid action: {action}")
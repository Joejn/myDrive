export interface Dir {
    "directories": [{
        "name": string,
        "path": string,
        "last_modified": number,
        "file_size": number
    }],

    "files": [{
        "name": string
        "path": string,
        "last_modified": number,
        "file_size": number
    }]
}

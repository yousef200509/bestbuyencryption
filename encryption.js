const forge = require('node-forge');

class Encryption {
    constructor(card) {
        this.publicKey
        this.terminalNo
        this.encryptionType
        this.card = card
        this.encryptedCard
    }

    async get_encryption_info() {
        // For some reason this takes a long time to connect, you can hardcode the values but this way is better
        let response = await got('https://www.bestbuy.ca/ch/config.json', {
            headers: {
                'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9,en-GB;q=0.8,fr;q=0.7,en-CA;q=0.6,fr-CA;q=0.5',
                'cache-control': 'max-age=0'
            },
            responseType: "json",
            throwHttpErrors: false
        })
        if(response.statusCode == 200){
            this.terminalNo = response.body.encryption.terminalNo
            this.publicKey = response.body.encryption.publicKey
            this.encryptionType = response.body.encryption.encryptionType
        } else {
            console.log("Failed to Fetch Encryption Info")
        }
    }

    async encrypt() {
        const publicKey = forge.pki.publicKeyFromPem(`-----BEGIN PUBLIC KEY-----${this.publicKey}-----END PUBLIC KEY-----`);
        const encryptionType = `${this.encryptionType}`;
        const e = forge.pkcs1.encode_rsa_oaep(publicKey, `${this.terminalNo}` + this.card, {
            md: forge.md[encryptionType].create(),
        });
        const ciphertext = forge.pki.rsa.encrypt(e, publicKey, true);
        this.encryptedCard =  forge.util.encode64(ciphertext) + this.card.substring(this.card.length, this.card.length - 4)

    }
}


const atlasCredentials = require("../credentials/atlas-credentials.json");

// # Dump db to a local folder
// mongodump mongodb://user:pwd@localhost/old_name -o ./dump 

module.export =
    console.log(
        "\x1b[42m",
        "\x1b[33m",
        `\n👾 \nmongodump mongodb://${atlasCredentials.username}:${atlasCredentials.password}@aiaiaiaminhavida.oobyz.mongodb.net/Enron -o ./dump\n👾`,
        "\x1b[0m"
    );

// # Restore the db with the new name
// mongorestore mongodb://user:pwd@localhost -d new_name ./dump/old_name

// # Try this flag if you get an authentication error
// --authenticationDatabase admin
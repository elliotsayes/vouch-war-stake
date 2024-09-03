local sqlite3 = require("lsqlite3")
local DbAdmin = require("DbAdmin")

function Init(db)
  db:exec [[
    CREATE TABLE IF NOT EXISTS Wallet(
      WalletId TEXT PRIMARY KEY NOT NULL,
      TimestampCreated INTEGER NOT NULL,
      TimestampModified INTEGER NOT NULL,
      ProcessId TEXT UNIQUE NOT NULL,
      TotalConfidenceValue INTEGER NOT NULL DEFAULT 0
    );
  ]]

  db:exec [[
    CREATE TABLE IF NOT EXISTS StakeHistory(
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      WalletId TEXT NOT NULL,
      Timestamp INTEGER NOT NULL,
      Quantity INTEGER NOT NULL,
      StakeDuration INTEGER NOT NULL,
      ConfidenceValue INTEGER NOT NULL,
      FOREIGN KEY (WalletId) REFERENCES Custody(WalletId)
    );
  ]]
end

VOUCH_DB = VOUCH_DB or sqlite3.open_memory()
VOUCH_DB_ADMIN = VOUCH_DB_ADMIN or DbAdmin.new(VOUCH_DB)

VOUCH_DB_INIT = VOUCH_DB_INIT or false
if not VOUCH_DB_INIT then
  Init(VOUCH_DB)
  VOUCH_DB_INIT = true
end

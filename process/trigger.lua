local sqlite3 = require("lsqlite3")
local DbAdmin = require("DbAdmin")

function Init(db)
  db:exec [[
    CREATE TABLE IF NOT EXISTS Triggers(
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      TimestampCreated INTEGER NOT NULL,
      Sender TEXT NOT NULL,
      TriggerTimestamp INTEGER NOT NULL,
      OtherTarget TEXT,
      TriggerComplete INTEGER NOT NULL DEFAULT 0,
      TimestampTriggered INTEGER
    );
  ]]
end

TRIGGER_DB = TRIGGER_DB or sqlite3.open_memory()
TRIGGER_DB_ADMIN = TRIGGER_DB_ADMIN or DbAdmin.new(TRIGGER_DB)

TRIGGER_DB_INIT = TRIGGER_DB_INIT or false
if not TRIGGER_DB_INIT then
  Init(TRIGGER_DB)
  TRIGGER_DB_INIT = true
end

function ValidateTriggerTimestamp(triggerTimestamp)
  local timestamp = tonumber(triggerTimestamp)
  if timestamp == nil or timestamp < 0 then
    return false
  end

  return true
end

function ValidateOtherTarget(otherTarget)
  -- Allow nil
  if otherTarget == nil then
    return true
  end

  if type(otherTarget) ~= "string" then
    return false
  end

  return true
end

function CreateTrigger(msg)
  local timestamp = msg.Timestamp
  local sender = msg.From
  local triggerTimestamp = msg.Tags["Trigger-Timestamp"]
  if not ValidateTriggerTimestamp(triggerTimestamp) then
    print("Invalid trigger timestamp")
    return
  end
  local triggerTimestampNumber = tonumber(triggerTimestamp)

  local otherTarget = msg.Tags["Target"]
  if not ValidateOtherTarget(otherTarget) then
    print("Invalid target")
    return
  end

  local stmt = TRIGGER_DB:prepare([[
    INSERT INTO Triggers (TimestampCreated, Sender, TriggerTimestamp, OtherTarget)
    VALUES (?, ?, ?, ?);
  ]], timestamp, sender, triggerTimestampNumber, otherTarget)
  stmt:step()
  local res = stmt:finalize()
  if res ~= sqlite3.OK then
    print("Error creating trigger")
    return
  end

  print("Trigger created")

  local confirm = tonumber(msg.Tags["Trigger-Confirm"]) > 0
  if confirm then
    print("Confirming trigger")
    local target = otherTarget or sender
    ao.send({
      Target = msg.From,
      Tags = {
        Action = "Trigger-Confirm",
        ['Trigger-Target'] = target,
        ['Trigger-Timestamp'] = triggerTimestamp,
      },
    })
  end
end

function ReadAndUpdateNewTriggers(msg)
  local timestamp = msg.Timestamp
  local stmt = TRIGGER_DB:prepare([[
    SELECT Id, Sender, OtherTarget FROM Triggers WHERE TriggerTimestamp <= ? AND TriggerComplete = 0;
  ]], timestamp)
  local triggers = {}
  for row in stmt:nrows() do
    local trigger = {
      Id = row.Id,
      Target = row.OtherTarget or row.Sender,
    }

    -- Insert if not the target is not already in the list
    local found = false
    for _, existingTrigger in ipairs(triggers) do
      if existingTrigger.Target == trigger.Target then
        found = true
        break
      end
    end
    if not found then
      table.insert(triggers, trigger)
    end
  end
  print("Found " .. #triggers .. " new triggers")
  stmt:finalize()

  -- Update all triggers using the same query filter
  local stmt = TRIGGER_DB:prepare([[
    UPDATE Triggers SET TriggerComplete = 1, TimestampTriggered = ? WHERE TriggerTimestamp <= ? AND TriggerComplete = 0;
  ]], timestamp, timestamp)
  stmt:step()
  local res = stmt:finalize()
  if res ~= sqlite3.OK then
    print("Error updating triggers")
    return
  end

  return triggers
end

function SendCronToTargets(msg, triggers)
  for _, trigger in ipairs(triggers) do
    print("Triggering " .. trigger.Target)
    ao.send({
      Target = trigger.Target,
      Tags = {
        Action = "Cron",
        ["Trigger-Id"] = trigger.Id,
      },
    })
  end
end

Handlers.add(
  "Register-Trigger",
  Handlers.utils.hasMatchingTag("Action", "Register-Trigger"),
  function(msg)
    CreateTrigger(msg)
  end
)

Handlers.add(
  "CronTick",
  Handlers.utils.hasMatchingTag("Action", "Cron"),
  function(msg)
    local triggers = ReadAndUpdateNewTriggers(msg)
    SendCronToTargets(msg, triggers)
  end
)

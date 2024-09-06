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
]])
  stmt:bind_values(timestamp, sender, triggerTimestampNumber, otherTarget)
  stmt:step()
  local res = stmt:finalize()
  if res ~= sqlite3.OK then
    print("Error creating trigger: " .. TRIGGER_DB:errmsg())
    return
  end

  print("Trigger created")

  local confirmValue = tonumber(msg.Tags["Trigger-Confirm"])
  local confirm = confirmValue and confirmValue > 0
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
  ]])
  stmt:bind_values(timestamp)

  local rowCount = 0
  local triggers = {}
  for row in stmt:nrows() do
    rowCount = rowCount + 1
    local trigger = {
      Ids = { row.Id },
      Target = row.OtherTarget or row.Sender,
    }

    -- Insert if not the target is not already in the list
    local found = false
    for _, existingTriggers in ipairs(triggers) do
      if existingTriggers.Target == trigger.Target then
        table.insert(existingTriggers.Ids, row.Id)
        found = true
        break
      end
    end
    if not found then
      table.insert(triggers, trigger)
    end
  end
  stmt:finalize()

  print("Found " .. rowCount .. " triggers for " .. #triggers .. " targets")

  -- Update all triggers using the same query filter
  local stmt = TRIGGER_DB:prepare([[
    UPDATE Triggers SET TriggerComplete = 1, TimestampTriggered = ? WHERE TriggerTimestamp <= ? AND TriggerComplete = 0;
  ]])
  stmt:bind_values(timestamp, timestamp)
  stmt:step()
  local res = stmt:finalize()
  if res ~= sqlite3.OK then
    error("Error updating triggers: " .. TRIGGER_DB:errmsg())
  end

  return triggers
end

function SendCronToTargets(triggers)
  for _, trigger in ipairs(triggers) do
    print("Triggering " .. trigger.Target)
    ao.send({
      Target = trigger.Target,
      Tags = {
        Action = "Cron",
        ["Trigger-Ids"] = table.concat(trigger.Ids, ","),
      },
    })
  end
end

Handlers.add(
  "Register-Trigger",
  Handlers.utils.hasMatchingTag("Action", "Register-Trigger"),
  function(msg)
    print("[Register-Trigger(" .. msg.Timestamp .. ")]")
    CreateTrigger(msg)
  end
)

Handlers.add(
  "CronTick",
  function(msg)
    return msg.Cron == true
  end,
  function(msg)
    print("[Cron(" .. msg.Timestamp .. ")] Check for trigger targets")
    local targets = ReadAndUpdateNewTriggers(msg)
    if targets ~= nil and #targets > 0 then
      SendCronToTargets(targets)
    end
  end
)

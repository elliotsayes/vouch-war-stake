---@diagnostic disable: duplicate-set-field
require("test.setup")()

_G.VerboseTests = 0                    -- how much logging to see (0 - none at all, 1 - important ones, 2 - everything)
_G.VirtualTime = _G.VirtualTime or nil -- use for time travel
-- optional logging function that allows for different verbosity levels
_G.printVerb = function(level)
  level = level or 2
  return function(...) -- define here as global so we can use it in application code too
    if _G.VerboseTests >= level then print(table.unpack({ ... })) end
  end
end

_G.Owner = '123MyOwner321'
_G.MainProcessId = '123xyzMySelfabc321'

_G.Processes = {
  ['<Dummy>'] = require 'test.mocked-env.processes.dummy' ('<Dummy>'),
}

_G.Handlers = require "handlers"

_G.ao = require "ao" (_G.MainProcessId) -- make global so that the main process and its non-mocked modules can use it
-- => every ao.send({}) in this test file effectively appears as if the message comes the main process

_G.ao.env = {
  Process = {
    Tags = {
      ["Name"] = "TriggerProcess",
      -- ... add other tags that would be passed in when the process is spawned
    }
  }
}

local trigger = require "trigger" -- require so that process handlers are loaded
-- local utils = require "utils"
-- local bint = require ".bint" (512)


local resetGlobals = function()
  -- according to initialization in process.lual
end

local startTimestamp = 1725605394430
local testDuration = 1000
local triggerTimestamp = startTimestamp + testDuration

describe("staking", function()
  setup(function()
    resetGlobals()
  end)

  teardown(function()
    -- to execute after this describe
  end)

  it("should start with no triggers", function()
    local count = _G.TRIGGER_DB_ADMIN:count("Triggers")
    assert.equal(0, count)
  end)

  it("should recieve a trigger", function()
    ao.send({
      Target = ao.id,
      From = "<Dummy>",
      Timestamp = startTimestamp,
      Tags = {
        Action = "Register-Trigger",
        ["Trigger-Timestamp"] = tostring(triggerTimestamp),
        -- ["Trigger-Confirm"] = "0",
      },
    })
    local rows = _G.TRIGGER_DB_ADMIN:exec("SELECT * FROM Triggers")
    assert.equal(1, #rows)
    assert.equal(triggerTimestamp, rows[1].TriggerTimestamp)
  end)

  it("should recieve another trigger", function()
    ao.send({
      Target = ao.id,
      From = "<Dummy>",
      Timestamp = startTimestamp,
      Tags = {
        Action = "Register-Trigger",
        ["Trigger-Timestamp"] = tostring(triggerTimestamp + 1),
        -- ["Trigger-Confirm"] = "0",
      },
    })
    local rows = _G.TRIGGER_DB_ADMIN:exec("SELECT * FROM Triggers")
    assert.equal(2, #rows)
    assert.equal(triggerTimestamp, rows[1].TriggerTimestamp)
    assert.equal(triggerTimestamp + 1, rows[2].TriggerTimestamp)
  end)

  it("should not trigger before", function()
    local beforeTriggerTimestamp = triggerTimestamp - 1
    ao.send({
      Target = ao.id,
      From = ao.id,
      Timestamp = beforeTriggerTimestamp,
      Cron = true
    })

    local triggersPending = _G.TRIGGER_DB_ADMIN:exec("SELECT * FROM Triggers WHERE TriggerComplete = 0")
    assert.equal(2, #triggersPending)

    local triggersComplete = _G.TRIGGER_DB_ADMIN:exec("SELECT * FROM Triggers WHERE TriggerComplete = 1")
    assert.equal(0, #triggersComplete)
  end)

  it("should trigger after", function()
    local afterTriggerTimestamp = triggerTimestamp + 2
    ao.send({
      Target = ao.id,
      From = ao.id,
      Timestamp = afterTriggerTimestamp,
      Cron = true
    })

    local triggersPending = _G.TRIGGER_DB_ADMIN:exec("SELECT * FROM Triggers WHERE TriggerComplete = 0")
    assert.equal(0, #triggersPending)

    local triggersComplete = _G.TRIGGER_DB_ADMIN:exec("SELECT * FROM Triggers WHERE TriggerComplete = 1")
    assert.equal(2, #triggersComplete)
  end)
end)

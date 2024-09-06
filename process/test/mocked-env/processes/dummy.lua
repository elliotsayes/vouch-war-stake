local json = require "json"

local function newmodule(selfId)
  local dummy = {}

  function dummy.handle(msg)
    print("[Dummy " .. selfId .. "] " .. (msg.Tags.Action or " action") .. " from " .. msg.From)
  end

  return dummy
end
return newmodule

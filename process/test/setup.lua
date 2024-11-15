local originalRequire = require

local function mockedRequire(moduleName)
  if moduleName == "ao" then
    return originalRequire("test.mocked-env.ao.ao")
  end

  if moduleName == "handlers-utils" then
    return originalRequire("test.mocked-env.ao.handlers-utils")
  end

  if moduleName == "handlers" then
    return originalRequire("test.mocked-env.ao.handlers")
  end

  if moduleName == "token" then
    return originalRequire("test.mocked-env.processes.token")
  end

  if moduleName == ".bint" then
    return originalRequire("test.mocked-env.lib.bint")
  end

  if moduleName == ".utils" then
    return originalRequire("test.mocked-env.lib.utils")
  end

  if moduleName == "json" then
    return originalRequire("test.mocked-env.lib.json")
  end

  if moduleName == "lsqlite3" then
    return originalRequire("lsqlite3complete")
  end

  if moduleName == "aoform.directory" then
    return {}
  end

  return originalRequire(moduleName)
end

return function()
  -- Override the require function globally for the tests
  _G.require = mockedRequire

  -- -- Restore the original require function after all tests
  -- teardown(function()
  --   _G.require = originalRequire
  -- end)
end

import { describe, it, beforeEach, expect } from "vitest"

describe("Avatar Contract", () => {
  let mockStorage: Map<string, any>
  let nextAvatarId: number
  
  beforeEach(() => {
    mockStorage = new Map()
    nextAvatarId = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "create-avatar":
        const [name] = args
        nextAvatarId++
        mockStorage.set(`avatar-${nextAvatarId}`, {
          owner: sender,
          name,
          level: 1,
          experience: 0,
        })
        return { success: true, value: nextAvatarId }
      
      case "gain-experience":
        const [avatarId, amount] = args
        const avatar = mockStorage.get(`avatar-${avatarId}`)
        if (!avatar) return { success: false, error: 404 }
        if (avatar.owner !== sender) return { success: false, error: 403 }
        avatar.experience += amount
        avatar.level += Math.floor(avatar.experience / 100)
        mockStorage.set(`avatar-${avatarId}`, avatar)
        return { success: true }
      
      case "get-avatar":
        return { success: true, value: mockStorage.get(`avatar-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should create an avatar", () => {
    const result = mockContractCall("create-avatar", ["CryptoExplorer"], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should gain experience and level up", () => {
    mockContractCall("create-avatar", ["CryptoExplorer"], "user1")
    const result = mockContractCall("gain-experience", [1, 150], "user1")
    expect(result.success).toBe(true)
    const avatar = mockContractCall("get-avatar", [1], "anyone").value
    expect(avatar.experience).toBe(150)
    expect(avatar.level).toBe(2)
  })
  
  it("should not gain experience for non-existent avatar", () => {
    const result = mockContractCall("gain-experience", [999, 100], "user1")
    expect(result.success).toBe(false)
    expect(result.error).toBe(404)
  })
  
  it("should not gain experience if not the owner", () => {
    mockContractCall("create-avatar", ["CryptoExplorer"], "user1")
    const result = mockContractCall("gain-experience", [1, 100], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should get avatar information", () => {
    mockContractCall("create-avatar", ["CryptoExplorer"], "user1")
    const result = mockContractCall("get-avatar", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      owner: "user1",
      name: "CryptoExplorer",
      level: 1,
      experience: 0,
    })
  })
})


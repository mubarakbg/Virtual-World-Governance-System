import { describe, it, beforeEach, expect } from "vitest"

describe("Economy Contract", () => {
  let mockBalances: Map<string, number>
  const CONTRACT_OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  
  beforeEach(() => {
    mockBalances = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "mint":
        const [mintAmount, recipient] = args
        if (sender !== CONTRACT_OWNER) return { success: false, error: 403 }
        mockBalances.set(recipient, (mockBalances.get(recipient) || 0) + mintAmount)
        return { success: true }
      
      case "transfer":
        const [transferAmount, transferSender, transferRecipient] = args
        if (sender !== transferSender) return { success: false, error: 403 }
        const senderBalance = mockBalances.get(transferSender) || 0
        if (senderBalance < transferAmount) return { success: false, error: "Insufficient balance" }
        mockBalances.set(transferSender, senderBalance - transferAmount)
        mockBalances.set(transferRecipient, (mockBalances.get(transferRecipient) || 0) + transferAmount)
        return { success: true }
      
      case "get-balance":
        return { success: true, value: mockBalances.get(args[0]) || 0 }
      
      case "get-total-supply":
        const totalSupply = Array.from(mockBalances.values()).reduce((sum, balance) => sum + balance, 0)
        return { success: true, value: totalSupply }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should mint currency", () => {
    const result = mockContractCall("mint", [1000, "user1"], CONTRACT_OWNER)
    expect(result.success).toBe(true)
    expect(mockBalances.get("user1")).toBe(1000)
  })
  
  it("should not mint currency if not contract owner", () => {
    const result = mockContractCall("mint", [1000, "user1"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should transfer currency", () => {
    mockContractCall("mint", [1000, "user1"], CONTRACT_OWNER)
    const result = mockContractCall("transfer", [500, "user1", "user2"], "user1")
    expect(result.success).toBe(true)
    expect(mockBalances.get("user1")).toBe(500)
    expect(mockBalances.get("user2")).toBe(500)
  })
  
  it("should not transfer currency if insufficient balance", () => {
    mockContractCall("mint", [1000, "user1"], CONTRACT_OWNER)
    const result = mockContractCall("transfer", [1500, "user1", "user2"], "user1")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Insufficient balance")
  })
  
  it("should get balance", () => {
    mockContractCall("mint", [1000, "user1"], CONTRACT_OWNER)
    const result = mockContractCall("get-balance", ["user1"], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1000)
  })
  
  it("should get total supply", () => {
    mockContractCall("mint", [1000, "user1"], CONTRACT_OWNER)
    mockContractCall("mint", [500, "user2"], CONTRACT_OWNER)
    const result = mockContractCall("get-total-supply", [], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1500)
  })
})


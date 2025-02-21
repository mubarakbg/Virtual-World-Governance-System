import { describe, it, beforeEach, expect } from "vitest"

describe("Land Management Contract", () => {
  let mockStorage: Map<string, any>
  let nextParcelId: number
  
  beforeEach(() => {
    mockStorage = new Map()
    nextParcelId = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "register-land-parcel":
        const [name, size, locationX, locationY] = args
        nextParcelId++
        mockStorage.set(`parcel-${nextParcelId}`, {
          owner: sender,
          name,
          size,
          location_x: locationX,
          location_y: locationY,
        })
        return { success: true, value: nextParcelId }
      
      case "transfer-land":
        const [parcelId, newOwner] = args
        const parcel = mockStorage.get(`parcel-${parcelId}`)
        if (!parcel) return { success: false, error: 404 }
        if (parcel.owner !== sender) return { success: false, error: 403 }
        parcel.owner = newOwner
        mockStorage.set(`parcel-${parcelId}`, parcel)
        return { success: true }
      
      case "get-land-parcel":
        return { success: true, value: mockStorage.get(`parcel-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should register a land parcel", () => {
    const result = mockContractCall("register-land-parcel", ["Central Park", 1000, 0, 0], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should transfer land ownership", () => {
    mockContractCall("register-land-parcel", ["Central Park", 1000, 0, 0], "user1")
    const result = mockContractCall("transfer-land", [1, "user2"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should not transfer land if not the owner", () => {
    mockContractCall("register-land-parcel", ["Central Park", 1000, 0, 0], "user1")
    const result = mockContractCall("transfer-land", [1, "user3"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should get land parcel information", () => {
    mockContractCall("register-land-parcel", ["Central Park", 1000, 0, 0], "user1")
    const result = mockContractCall("get-land-parcel", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      owner: "user1",
      name: "Central Park",
      size: 1000,
      location_x: 0,
      location_y: 0,
    })
  })
})


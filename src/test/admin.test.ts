import { describe, it, expect } from "vitest"

// Test admin email validation logic
const ADMIN_EMAILS = "raphael@exemplo.com"

function isAdminEmail(email: string): boolean {
  const admins = ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()).filter(Boolean)
  return admins.includes(email.toLowerCase())
}

describe("Admin Authorization", () => {
  it("allows authorized email", () => {
    expect(isAdminEmail("raphael@exemplo.com")).toBe(true)
  })

  it("blocks unauthorized email", () => {
    expect(isAdminEmail("outro@email.com")).toBe(false)
  })

  it("is case insensitive", () => {
    expect(isAdminEmail("RAPHAEL@EXEMPLO.COM")).toBe(true)
  })

  it("handles multiple admin emails", () => {
    const multiAdmin = "admin1@test.com,admin2@test.com"
    const admins = multiAdmin.split(",").map(e => e.trim().toLowerCase())
    expect(admins.includes("admin1@test.com")).toBe(true)
    expect(admins.includes("admin2@test.com")).toBe(true)
    expect(admins.includes("admin3@test.com")).toBe(false)
  })

  it("handles empty admin list", () => {
    const empty = ""
    const admins = empty.split(",").map(e => e.trim().toLowerCase()).filter(Boolean)
    expect(admins).toHaveLength(0)
  })
})

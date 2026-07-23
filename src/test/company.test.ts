import { describe, it, expect } from "vitest"
import { z } from "zod"

const companySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  trade_name: z.string().optional(),
  segment: z.string().optional(),
  description: z.string().optional(),
  main_city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
})

describe("Company Validation", () => {
  it("validates a complete company", () => {
    const result = companySchema.safeParse({
      name: "Empresa Teste",
      trade_name: "Teste",
      segment: "Tecnologia",
      main_city: "São Paulo",
      state: "SP",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = companySchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects short name", () => {
    const result = companySchema.safeParse({ name: "A" })
    expect(result.success).toBe(false)
  })

  it("validates website URL", () => {
    const valid = companySchema.safeParse({ name: "Teste", website: "https://exemplo.com" })
    expect(valid.success).toBe(true)

    const invalid = companySchema.safeParse({ name: "Teste", website: "not-a-url" })
    expect(invalid.success).toBe(false)
  })

  it("validates email", () => {
    const valid = companySchema.safeParse({ name: "Teste", email: "teste@exemplo.com" })
    expect(valid.success).toBe(true)

    const invalid = companySchema.safeParse({ name: "Teste", email: "not-an-email" })
    expect(invalid.success).toBe(false)
  })

  it("allows empty optional fields", () => {
    const result = companySchema.safeParse({ name: "Empresa" })
    expect(result.success).toBe(true)
  })
})

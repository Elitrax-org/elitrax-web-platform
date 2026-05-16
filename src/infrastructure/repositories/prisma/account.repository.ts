import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { AccountRepository } from "@/application/ports/repositories";
import {
  mapAccount,
  mapInvitation,
  mapMembership,
} from "./mappers";

/**
 * Implementación Prisma para cuentas, membresías e invitaciones.
 */
export function createPrismaAccountRepository(
  prisma: PrismaClient,
): AccountRepository {
  return {
    // Crea cuenta y garantiza membresía owner en una única transacción.
    async createAccount({
      type,
      displayName,
      ownerUserId,
      address,
      contact,
      billing,
    }) {
      const created = await prisma.$transaction(async (tx) => {
        const account = await tx.accounts.create({
          data: {
            type,
            display_name: displayName.trim(),
            owner_user_id: ownerUserId,
            country_code: address.countryCode,
            city: address.city,
            address_line1: address.line1,
            address_line2: address.line2 ?? null,
            postal_code: address.postalCode ?? null,
            region: address.region ?? null,
            contact_email: contact.email,
            contact_phone: contact.phone,
            billing_legal_name: billing.legalName ?? null,
            billing_tax_id: billing.taxId ?? null,
            billing_email: billing.billingEmail ?? null,
            billing_address: billing.billingAddress as unknown as object,
          },
        });
        await tx.account_members.create({
          data: {
            account_id: account.id,
            user_id: ownerUserId,
            role: "owner",
            joined_at: new Date(),
          },
        });
        return account;
      });
      return mapAccount(created);
    },

    // Obtiene cuenta por id dentro del contexto global de cuentas.
    async getAccount(accountId) {
      const row = await prisma.accounts.findUnique({ where: { id: accountId } });
      return row ? mapAccount(row) : null;
    },

    async listMemberships(userId) {
      const rows = await prisma.account_members.findMany({
        where: { user_id: userId },
      });
      return rows.map(mapMembership);
    },

    async getMembership(accountId, userId) {
      const row = await prisma.account_members.findUnique({
        where: { account_id_user_id: { account_id: accountId, user_id: userId } },
      });
      return row ? mapMembership(row) : null;
    },

    async countMembers(accountId) {
      return prisma.account_members.count({ where: { account_id: accountId } });
    },

    async addMember({ accountId, userId, role }) {
      const row = await prisma.account_members.create({
        data: {
          account_id: accountId,
          user_id: userId,
          role,
          joined_at: new Date(),
        },
      });
      return mapMembership(row);
    },

    async createInvitation({ accountId, email, role, expiresAt }) {
      const row = await prisma.invitations.create({
        data: {
          account_id: accountId,
          email: email.trim().toLowerCase(),
          role,
          expires_at: new Date(expiresAt),
        },
      });
      return mapInvitation(row);
    },
  };
}

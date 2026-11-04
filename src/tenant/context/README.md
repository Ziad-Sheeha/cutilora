# Tenant context

Keep active tenant, clinic and branch selection separate. A selected clinic must belong to the active tenant, and a selected branch must belong to the active clinic. The backend must validate every scope on every request.

"use client";

import Dexie, { type Table } from "dexie";
import type { PersistedClient, Persister } from "@tanstack/query-persist-client-core";

// Cópia local (IndexedDB) do cache de dados: biblioteca, listas, setup e perfil
// abrem sem internet com o que foi visto da última vez.

class BancoLocal extends Dexie {
  cache!: Table<{ chave: string; valor: PersistedClient }, string>;

  constructor() {
    super("zerei");
    this.version(1).stores({ cache: "chave" });
  }
}

let banco: BancoLocal | null = null;
const abrir = () => (banco ??= new BancoLocal());

const CHAVE = "consultas";

export const persistidorDexie: Persister = {
  async persistClient(cliente) {
    try {
      await abrir().cache.put({ chave: CHAVE, valor: cliente });
    } catch {
      // IndexedDB indisponível (aba anônima em alguns navegadores): segue sem cópia local
    }
  },
  async restoreClient() {
    try {
      return (await abrir().cache.get(CHAVE))?.valor;
    } catch {
      return undefined;
    }
  },
  async removeClient() {
    try {
      await abrir().cache.delete(CHAVE);
    } catch {
      // nada a fazer
    }
  },
};

/** Ao sair da conta, apaga a cópia local para o próximo usuário não ver nada. */
export async function limparCopiaLocal() {
  await persistidorDexie.removeClient();
}

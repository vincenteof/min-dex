import { Abi } from 'abitype'
import { Address } from 'viem'
import deployedContracts from '@/contracts/deployedContracts'
import externalContracts from '@/contracts/externalContracts'

export type InheritedFunctions = { readonly [key: string]: string }
export type GenericContract = {
  address: Address
  abi: Abi
  inheritedFunctions?: InheritedFunctions
}

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract
  }
}

const deepMergeContracts = <
  D extends Record<PropertyKey, any>,
  S extends Record<PropertyKey, any>
>(
  destination: D,
  source: S
) => {
  const result: Record<PropertyKey, any> = {}
  const allKeys = Array.from(
    new Set([...Object.keys(source), ...Object.keys(destination)])
  )
  for (const key of allKeys) {
    result[key] = { ...destination[key], ...source[key] }
  }
  return result
}

const contractsData = deepMergeContracts(deployedContracts, externalContracts)

export const contracts = contractsData as GenericContractsDeclaration | null

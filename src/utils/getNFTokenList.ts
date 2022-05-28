// import { TokenList } from '@uniswap/token-lists'

import { NFTokenList } from '../state/merge/reducer'
// import { ValidateFunction } from 'ajv'
// import contenthashToUri from './contenthashToUri'
// import { parseENSAddress } from './parseENSAddress'
import uriToHttp from './uriToHttp'

// lazily get the validator the first time it is used
// const getTokenListValidator = (() => {
//   let tokenListValidator: Promise<ValidateFunction>
//   return () => {
//     if (!tokenListValidator) {
//       tokenListValidator = new Promise<ValidateFunction>(async (resolve) => {
//         const [ajv, schema] = await Promise.all([
//           import('ajv'),
//           import('@uniswap/token-lists/src/tokenlist.schema.json'),
//         ])
//         const validator = new ajv.default({ allErrors: true }).compile(schema)
//         resolve(validator)
//       })
//     }
//     return tokenListValidator
//   }
// })()

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 * @param resolveENSContentHash resolves an ens name to a contenthash
 */
export default async function getNFTokenList(
  nftUrl: string
  // resolveENSContentHash: (ensName: string) => Promise<string>
): Promise<NFTokenList> {
  // const tokenListValidator = getTokenListValidator()
  // const parsedENS = parseENSAddress(nftUrl)
  // let urls: string[]
  // if (parsedENS) {
  //   let contentHashUri
  //   try {
  //     contentHashUri = await resolveENSContentHash(parsedENS.ensName)
  //   } catch (error) {
  //     console.debug(`Failed to resolve ENS name: ${parsedENS.ensName}`, error)
  //     throw new Error(`Failed to resolve ENS name: ${parsedENS.ensName}`)
  //   }
  //   let translatedUri
  //   try {
  //     translatedUri = contenthashToUri(contentHashUri)
  //   } catch (error) {
  //     console.debug('Failed to translate contenthash to URI', contentHashUri)
  //     throw new Error(`Failed to translate contenthash to URI: ${contentHashUri}`)
  //   }
  //   urls = uriToHttp(`${translatedUri}${parsedENS.ensPath ?? ''}`)
  // } else {
  const urls = uriToHttp(nftUrl)
  // }
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isLast = i === urls.length - 1
    let response
    try {
      response = await fetch(url, { credentials: 'omit' })
    } catch (error) {
      console.debug('Failed to fetch list', nftUrl, error)
      if (isLast) throw new Error(`Failed to download list ${nftUrl}`)
      continue
    }

    if (!response.ok) {
      if (isLast) throw new Error(`Failed to download list ${nftUrl}`)
      continue
    }

    const json: NFTokenList = {
      name: '',
      timestamp: '',
      tokens: [],
    }
    const datas = await response.json()
    // if (!datas || datas.length < 1) {
    //   return json;
    // }

    datas.assets.forEach(
      (data: {
        token_id: string
        image_url: string
        name: string
        description: string
        asset_contract: {
          address: string
          symbol: string
          name: string
        }
        permalink: string
      }) => {
        json.tokens.push({
          tokenId: data.token_id,
          tokenURI: data.image_url,
          tokenName: data.name,
          description: data.description,
          contract: data.asset_contract.address,
          symbol: data.asset_contract.symbol,
          contractName: data.asset_contract.name,
          openseaUrl: data.permalink,
          isMatter: false,
        })
      }
    )

    // const [json] = await Promise.all([response.json()])
    // if (!validator(json)) {
    //   const validationErrors: string =
    //     validator.errors?.reduce<string>((memo, error) => {
    //       const add = `${error.dataPath} ${error.message ?? ''}`
    //       return memo.length > 0 ? `${memo}; ${add}` : `${add}`
    //     }, '') ?? 'unknown error'
    //   throw new Error(`Token list failed validation: ${validationErrors}`)
    // }
    return json
  }
  throw new Error('Unrecognized list URL protocol.')
}

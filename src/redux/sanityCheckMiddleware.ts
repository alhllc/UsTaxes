import { Middleware } from 'redux'
import { isRight } from 'ustaxes/core/util'
import { YearsTaxesState } from './data'
import { create1040 as create1040_2020 } from 'ustaxes/forms/Y2020/irsForms/Main'
import { create1040 as create1040_2021 } from 'ustaxes/forms/Y2021/irsForms/Main'
import { create1040 as create1040_2022 } from 'ustaxes/forms/Y2022/irsForms/Main'
import { create1040 as create1040_2023 } from 'ustaxes/forms/Y2023/irsForms/Main'
import { create1040 as create1040_2024 } from 'ustaxes/forms/Y2024/irsForms/Main'
import { Asset, Information } from 'ustaxes/core/data'
import { Either } from 'ustaxes/core/util'
import { F1040Error } from 'ustaxes/forms/errors'
import Form from 'ustaxes/core/irsForms/Form'
import { F1040Base } from 'ustaxes/forms/F1040Base' // Assuming F1040Base is exported or compatible type

// Define a type that matches the F1040 structure we need (l24 and l35a)
// Since we import create1040 from different years, they might return slightly different F1040 classes.
// But they all should have l24 and l35a methods.
interface MinimalF1040 {
  l24: () => number
  l35a: () => number
}

type Create1040Fn = (
  info: Information,
  assets: Asset<Date>[]
) => Either<F1040Error[], [MinimalF1040, Form[]]>

const create1040Map: Record<string, Create1040Fn> = {
  Y2020: create1040_2020 as unknown as Create1040Fn,
  Y2021: create1040_2021 as unknown as Create1040Fn,
  Y2022: create1040_2022 as unknown as Create1040Fn,
  Y2023: create1040_2023 as unknown as Create1040Fn,
  Y2024: create1040_2024 as unknown as Create1040Fn
}

export const sanityCheckMiddleware: Middleware<{}, YearsTaxesState> = store => next => action => {
  const result = next(action)
  const state = store.getState()

  const activeYear = state.activeYear
  const info = state[activeYear]
  const assets = state.assets

  // Skip if we don't have information or assets (e.g. initial load)
  // Although assets can be empty array.
  if (!info) return result

  const create1040 = create1040Map[activeYear]

  // If year not supported (e.g. Y2019), skip
  if (!create1040) return result

  // create1040 expects Asset<Date>[], state.assets is Asset<Date>[] because of transforms
  const f1040Result = create1040(info, assets)

  if (isRight(f1040Result)) {
    const [f1040] = f1040Result.right
    const totalTax = f1040.l24()
    const refund = f1040.l35a()

    const checks = [
      {
        condition: totalTax < 0,
        msg: `CRITICAL: Negative Total Tax Calculated: ${totalTax}`
      },
      {
        condition: Number.isNaN(refund),
        msg: "CRITICAL: Refund is NaN (Math Error)"
      }
    ]

    checks.forEach(check => {
      if (check.condition) {
        console.error(check.msg, { action, state })
        // TODO: Send to Sentry/LogRocket here
      }
    })
  }

  return result
}

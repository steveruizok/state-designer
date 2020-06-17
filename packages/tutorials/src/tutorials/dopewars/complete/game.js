import { createState } from "@state-designer/react"
import { sample, random, shuffle, range } from "lodash"
import { Cities, Drugs } from "./static"
const CitiesArr = Object.values(Cities)
const DrugsArr = Object.values(Drugs)

function getCity(name) {
  const city = Cities[name]
  const drugs = shuffle(DrugsArr).slice(
    0,
    random(city.min_drugs, city.max_drugs)
  )

  return {
    name: city.name,
    drugs: drugs.map((drug) => drug.name),
    prices: Object.fromEntries(
      drugs.map((drug, i) => {
        return [drug.name, random(drug.minimum_price, drug.maximum_price)]
      })
    ),
  }
}

const home = sample(CitiesArr).name

export default createState({
  data: {
    selection: {
      name: undefined,
      price: 0,
      quantity: 0,
      amount: 0,
    },
    game: {
      day: 1,
      end: 30,
      debt: 550,
      bank: 0,
      stoneLevel: 0,
      city: getCity(home),
    },
    coat: {
      drugs: Object.fromEntries(DrugsArr.map((drug) => [drug.name, 0])),
      cash: 2000,
      guns: [],
      health: 100,
      totalSpace: 100,
      home,
    },
  },
  initial: "playing",
  states: {
    playing: {
      states: {
        city: {
          initial: {
            if: "cityIsHome",
            to: "home",
            else: { to: "away" },
          },
          states: {
            home: {
              on: {
                VISITED_LOAN_SHARK: {
                  to: "loanshark",
                },
                VISITED_BANK: {
                  to: "bank",
                },
              },
            },
            away: {},
          },
        },
        location: {
          initial: "street",
          states: {
            street: {
              onEnter: {
                if: "ranOutOfDays",
                to: "gameover",
              },
              on: {
                VISITED_SUBWAY: {
                  to: "subway",
                },
              },
              initial: "dealing",
              states: {
                dealing: {
                  on: {
                    STARTED_BUYING: { do: "setSelection", to: "buying" },
                    STARTED_SELLING: { do: "setSelection", to: "selling" },
                  },
                },
                buying: {
                  on: {
                    EXITED: { do: "resetSelection", to: "dealing" },
                    CHANGED_QUANTITY: "setSelectionQuantity",
                    BOUGHT: [
                      {
                        get: "availableSpace",
                        if: "canFitDrugsInCoat",
                        then: {
                          get: "amount",
                          if: "canAffordAmount",
                          do: ["buy", "addDrugToCoat", "resetSelection"],
                          to: "dealing",
                        },
                      },
                    ],
                  },
                },
                selling: {
                  on: {
                    EXITED: { do: "resetSelection", to: "dealing" },
                    CHANGED_QUANTITY: "setSelectionQuantity",
                    SOLD: {
                      if: "hasDrugsInCoat",
                      do: ["removeDrugFromCoat", "sell", "resetSelection"],
                      to: "dealing",
                    },
                  },
                },
              },
            },
            bank: {
              on: {
                WITHDREW_CASH: {
                  if: "bankContainsCash",
                  do: ["takeCashFromBank", "moveCashToCoat", "resetSelection"],
                },
                DEPOSITED_CASH: {
                  if: "coatContainsCash",
                  do: ["takeCashFromCoat", "moveCashToBank", "resetSelection"],
                },
                CHANGED_AMOUNT: "setSelectionAmount",
                EXITED: { do: "resetSelection", to: "street" },
              },
            },
            loanshark: {
              initial: {
                if: "isInDebt",
                to: "inDebt",
                else: { to: "canBorrow" },
              },
              states: {
                inDebt: {
                  on: {
                    PAID_LOAN: [
                      {
                        if: "coatContainsCash",
                        do: [
                          "takeCashFromCoat",
                          "reduceDebt",
                          "resetSelection",
                        ],
                      },
                      {
                        unless: "isInDebt",
                        to: "paidOff",
                      },
                    ],
                  },
                },
                paidOff: {
                  onEnter: {
                    to: "canBorrow",
                    wait: 2,
                  },
                },
                canBorrow: {
                  on: {
                    TOOK_LOAN: {
                      do: ["moveCashToCoat", "increaseDebt", "resetSelection"],
                      to: "inDebt",
                    },
                  },
                },
              },
              on: {
                CHANGED_AMOUNT: "setSelectionAmount",
                EXITED: { do: "resetSelection", to: "street" },
              },
            },
            subway: {
              initial: "selecting",
              states: {
                selecting: {
                  on: {
                    MOVED: { to: "traveling" },
                    EXITED: { do: "resetSelection", to: "street" },
                  },
                },
                traveling: {
                  onEnter: [
                    {
                      do: ["changeCity", "changeDay"],
                      to: ["city", "street"],
                      wait: 1.5,
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    gameover: {},
  },
  results: {
    amount(data, { price, quantity }) {
      return price * quantity
    },
    availableSpace(data) {
      let remainingSpace = data.coat.totalSpace
      for (let key in data.coat.drugs) {
        remainingSpace -= data.coat.drugs[key]
      }
      return remainingSpace
    },
  },
  conditions: {
    cityIsHome(data) {
      return data.game.city.name === data.coat.home
    },
    ranOutOfDays(data) {
      return data.game.day > data.game.end
    },
    isInDebt(data) {
      return data.game.debt > 0
    },
    canFitDrugsInCoat(data, { quantity }, availableSpace) {
      return availableSpace >= quantity
    },
    canAffordAmount(data, _, amount) {
      return data.coat.cash >= amount
    },
    hasDrugsInCoat(data, { name, quantity }) {
      console.log(name, data.coat.drugs[name], quantity)
      return data.coat.drugs[name] >= quantity
    },
    coatContainsCash(data, { amount }) {
      return data.coat.cash >= amount
    },
    bankContainsCash(data, { amount }) {
      return data.game.bank >= amount
    },
  },
  actions: {
    resetSelection(data) {
      data.selection = {
        name: undefined,
        price: 0,
        quantity: 0,
        amount: 0,
      }
    },
    setSelection(data, { name, price }) {
      Object.assign(data.selection, { name, price })
    },
    setSelectionAmount(data, { amount }) {
      data.selection.amount = amount
    },
    setSelectionQuantity(data, { quantity }) {
      data.selection.quantity = quantity
    },
    addDrugToCoat(data, { name, quantity }) {
      data.coat.drugs[name] += quantity
    },
    removeDrugFromCoat(data, { name, quantity }) {
      data.coat.drugs[name] -= quantity
    },
    buy(data, { price, quantity }) {
      data.coat.cash -= price * quantity
    },
    sell(data, { price, quantity }) {
      data.coat.cash += price * quantity
    },
    reduceDebt(data, { amount }) {
      data.game.debt -= amount
    },
    increaseDebt(data, { amount }) {
      data.game.debt += amount
    },
    takeCashFromBank(data, { amount }) {
      data.game.bank -= amount
    },
    moveCashToBank(data, { amount }) {
      data.game.bank += amount
    },
    takeCashFromCoat(data, { amount }) {
      data.coat.cash -= amount
    },
    moveCashToCoat(data, { amount }) {
      data.coat.cash += amount
    },
    changeCity(data, { name }) {
      data.game.city = getCity(name)
    },
    changeDay(data) {
      data.game.day++
      data.game.debt = Math.round(data.game.debt * 1.1)
    },
    dropDrug(data, { name, quantity }) {
      data.coat.drugs[name] -= quantity
    },
  },
  values: {
    quantities(data) {
      let remainingSpace = data.coat.totalSpace

      for (let key in data.coat.drugs) {
        remainingSpace -= data.coat.drugs[key]
      }

      return Object.fromEntries(
        data.game.city.drugs.map((name) => [
          name,
          {
            buy: Math.floor(
              Math.min(
                remainingSpace,
                data.coat.cash / data.game.city.prices[name]
              )
            ),
            sell: data.coat.drugs[name],
          },
        ])
      )
    },
    score(data) {
      let score = data.coat.cash - data.game.debt

      for (let name of data.game.city.drugs) {
        score += data.coat.drugs[name] * data.game.city.prices[name]
      }

      return score
    },
  },
})

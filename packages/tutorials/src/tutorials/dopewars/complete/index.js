import React from "react"
import { sample, random, shuffle, range } from "lodash"
import { Layout, HStack, VStack } from "components"
import { useStateDesigner } from "@state-designer/react"
import { Heading, NumberInput, Button, Divider } from "@chakra-ui/core"
import * as Static from "./static"

function getCity(name) {
  const city = Static.CitiesDict[name]
  const drugs = shuffle(Static.Drugs).slice(
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

export default function () {
  const home = sample(Static.Cities).name

  const state = useStateDesigner({
    data: {
      game: {
        day: 1,
        end: 30,
        debt: 550,
        bank: 0,
        stoneLevel: 0,
        city: getCity(home),
      },
      coat: {
        drugs: Object.fromEntries(Static.Drugs.map((drug) => [drug.name, 0])),
        cash: 2000,
        guns: [],
        health: 100,
        totalSpace: 100,
        home,
      },
    },
    initial: "street",
    states: {
      street: {
        onEnter: {
          if: "ranOutOfDays",
          to: "gameover",
        },
        on: {
          BOUGHT: {
            get: "availableSpace",
            if: "canFitDrugsInCoat",
            then: {
              get: "amount",
              if: "canAffordAmount",
              do: ["buy", "addDrugToCoat"],
            },
          },
          SOLD: {
            if: "hasDrugsInCoat",
            do: ["removeDrugFromCoat", "sell"],
          },
          MOVED: {
            to: "subway",
          },
        },
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
      bank: {
        on: {
          WITHDREW_CASH: {
            if: "bankContainsCash",
            do: ["takeCashFromBank", "moveCashToCoat"],
          },
          DEPOSITED_CASH: {
            if: "coatContainsCash",
            do: ["takeCashFromCoat", "moveCashToBank"],
          },
          EXITED: { to: "street.previous" },
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
                  do: ["takeCashFromCoat", "reduceDebt"],
                },
                {
                  unless: "isInDebt",
                  to: "canBorrow",
                },
              ],
            },
          },
          canBorrow: {
            on: {
              TOOK_LOAN: {
                do: ["moveCashToCoat", "increaseDebt"],
                to: "inDebt",
              },
            },
          },
        },
        on: {
          EXITED: { to: "street.previous" },
        },
      },
      subway: {
        onEnter: [
          {
            to: "street",
            do: ["changeCity", "changeDay"],
            wait: 1,
          },
        ],
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

  return (
    <Layout>
      <Heading size="md">Score: {state.values.score}</Heading>
      <Heading size="md">Cash: ${state.data.coat.cash.toFixed(2)}</Heading>
      <Heading size="md">Bank: ${state.data.game.bank.toFixed(2)}</Heading>
      <Heading size="md">Debt: ${state.data.game.debt.toFixed(2)}</Heading>
      <Divider />
      <Heading size="md">Day: {state.data.game.day}</Heading>
      <Heading>
        {state.whenIn({
          city: state.data.game.city.name,
          subway: "Subway...",
          gameover: "Game over!",
        })}
      </Heading>
      <Divider />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px auto 72px 64px 72px 64px",
          gridColumnGap: 16,
          gridRowGap: 4,
          alignItems: "center",
        }}
      >
        <div style={{ gridColumn: "3 / span 2", textAlign: "center" }}>Buy</div>
        <div style={{ gridColumn: "5 / span 2", textAlign: "center" }}>
          Sell
        </div>
        {state.data.game.city.drugs.map((name) => {
          const { buy, sell } = state.values.quantities[name]
          const price = state.data.game.city.prices[name]
          const drug = Static.DrugsDict[name]

          return (
            <React.Fragment key={drug.name}>
              <div>
                {drug.name} ({state.data.coat.drugs[drug.name]})
              </div>
              <div style={{ textAlign: "right" }}>${price}</div>
              <Button
                onClick={() =>
                  state.send("BOUGHT", { name, price, quantity: 1 })
                }
              >
                Buy
              </Button>
              <Button
                onClick={() =>
                  state.send("BOUGHT", { name, price, quantity: buy })
                }
              >
                Max
              </Button>
              <Button
                onClick={() => state.send("SOLD", { name, price, quantity: 1 })}
              >
                Sell
              </Button>
              <Button
                onClick={() =>
                  state.send("SOLD", { name, price, quantity: sell })
                }
              >
                Max
              </Button>
            </React.Fragment>
          )
        })}
      </div>
      <Divider />
      {state.whenIn({
        "street.home": (
          <VStack>
            <Heading size="md">Home</Heading>
            <Button onClick={() => state.send("VISITED_BANK")}>
              Visit Bank
            </Button>
            <Button onClick={() => state.send("VISITED_LOAN_SHARK")}>
              Visit Loan Shark
            </Button>
          </VStack>
        ),
        "loanshark.inDebt": (
          <VStack>
            <NumberInput />
            <Button onClick={() => state.send("PAID_LOAN", { amount: 50 })}>
              Pay Debt
            </Button>
            <Button onClick={() => state.send("EXITED")}>Exit</Button>
          </VStack>
        ),
        "loanshark.canBorrow": (
          <VStack>
            <NumberInput />
            <Button onClick={() => state.send("TOOK_LOAN", { amount: 50 })}>
              Borrow
            </Button>
            <Button onClick={() => state.send("EXITED")}>Exit</Button>
          </VStack>
        ),
        bank: (
          <VStack>
            <NumberInput />
            <Button
              onClick={() => state.send("DEPOSITED_CASH", { amount: 10 })}
            >
              Deposit
            </Button>
            <NumberInput />
            <Button onClick={() => state.send("WITHDREW_CASH", { amount: 10 })}>
              Withdraw
            </Button>
            <Button onClick={() => state.send("EXITED")}>Exit</Button>
          </VStack>
        ),
      })}
      <VStack>
        <Heading size="md">Move To</Heading>
        {Static.Cities.map((city) => (
          <Button
            key={city.name}
            disabled={city.name === state.data.game.city.name}
            onClick={() => state.send("MOVED", { name: city.name })}
          >
            {city.name} {city.name === state.data.coat.home && "(Home)"}
          </Button>
        ))}
      </VStack>
      <Divider />
    </Layout>
  )
}

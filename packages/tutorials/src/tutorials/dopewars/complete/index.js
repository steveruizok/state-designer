import React from "react"
import { Layout, VStack } from "components"
import { useStateDesigner } from "@state-designer/react"
import { Text, Heading, NumberInput, Button, Divider } from "@chakra-ui/core"
import game from "./game"
import { Cities, Drugs } from "./static"
const CitiesArr = Object.values(Cities)

export default function () {
  const state = useStateDesigner(game)

  return (
    <Layout>
      <Stats />
      <Heading>
        {state.whenIn({
          street: state.data.game.city.name,
          subway: "Subway...",
          gameover: "Game over!",
        })}
      </Heading>
      <Divider />
      {state.whenIn({
        loanshark: <LoanSharkScreen />,
        bank: <BankScreen />,
        buying: <BuyScreen />,
        selling: <SellScreen />,
        idle: (
          <>
            <Menu />
            {state.isIn("home") && <TravelLinks />}
            <CityLinks />
          </>
        ),
      })}
    </Layout>
  )
}

function Stats() {
  const state = useStateDesigner(game)
  return (
    <>
      <Heading size="sm">Score: {state.values.score}</Heading>
      <Heading size="sm">Cash: ${state.data.coat.cash.toFixed(2)}</Heading>
      <Heading size="sm">Bank: ${state.data.game.bank.toFixed(2)}</Heading>
      <Heading size="sm">Debt: ${state.data.game.debt.toFixed(2)}</Heading>{" "}
      <Heading size="sm">Day: {state.data.game.day}</Heading>
      <Divider />
    </>
  )
}

function BuyScreen() {
  const state = useStateDesigner(game)
  return (
    <VStack>
      <Heading size="md">
        Buying {state.data.selection.name} $
        {state.data.selection.price?.toFixed()}
      </Heading>
      <NumberInput
        min={0}
        max={state.values.quantities[state.data.selection.name]?.buy}
        value={state.data.selection.quantity}
        onChange={(quantity) => state.send("CHANGED_QUANTITY", { quantity })}
      />
      <Button
        onClick={() =>
          state.send("CHANGED_QUANTITY", {
            quantity: state.values.quantities[state.data.selection.name]?.buy,
          })
        }
      >
        Max
      </Button>
      <Button onClick={() => state.send("BOUGHT", state.data.selection)}>
        Buy
      </Button>
      <Button onClick={() => state.send("CANCELLED")}>Cancel</Button>
    </VStack>
  )
}

function SellScreen() {
  const state = useStateDesigner(game)
  return (
    <VStack>
      <Heading size="md">
        Selling {state.data.selection.name} $
        {state.data.selection.price?.toFixed()}
      </Heading>
      <NumberInput
        min={0}
        max={state.values.quantities[state.data.selection.name]?.sell}
        value={state.data.selection.quantity}
        onChange={(quantity) => state.send("CHANGED_QUANTITY", { quantity })}
      />
      <Button
        onClick={() =>
          state.send("CHANGED_QUANTITY", {
            quantity: state.values.quantities[state.data.selection.name]?.sell,
          })
        }
      >
        Max
      </Button>
      <Button onClick={() => state.send("SOLD", state.data.selection)}>
        Sell
      </Button>
      <Button onClick={() => state.send("CANCELLED")}>Cancel</Button>
    </VStack>
  )
}

function Menu() {
  const state = useStateDesigner(game)
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto 72px 72px",
          gridColumnGap: 16,
          gridRowGap: 4,
          alignItems: "center",
        }}
      >
        {state.data.game.city.drugs.map((name) => {
          const drug = Drugs[name]
          const price = state.data.game.city.prices[name]
          const quantity = state.data.coat.drugs[name]

          const isCheap =
            price <
            drug.minimum_price + (drug.maximum_price - drug.minimum_price) / 5

          const isExpensive =
            price >
            drug.maximum_price - (drug.maximum_price - drug.minimum_price) / 5

          return (
            <React.Fragment key={drug.name}>
              <Text>
                {drug.name} ({quantity})
              </Text>
              <Text
                style={{
                  textAlign: "right",
                  color: isCheap ? "green" : isExpensive ? "red" : "text",
                }}
              >
                ${price}
              </Text>
              <Button
                disabled={price > state.data.coat.cash}
                onClick={() => state.send("STARTED_BUYING", { name, price })}
              >
                Buy
              </Button>
              <Button
                disabled={quantity === 0}
                onClick={() => state.send("STARTED_SELLING", { name, price })}
              >
                Sell
              </Button>
            </React.Fragment>
          )
        })}
      </div>
      <Divider />
    </>
  )
}

function TravelLinks() {
  return (
    <VStack>
      <Heading size="md">Home</Heading>
      <Button onClick={() => game.send("VISITED_BANK")}>Visit Bank</Button>
      <Button onClick={() => game.send("VISITED_LOAN_SHARK")}>
        Visit Loan Shark
      </Button>
      <Divider />
    </VStack>
  )
}

function LoanSharkScreen() {
  const state = useStateDesigner(game)
  return (
    <div>
      hello
      {state.whenIn({
        inDebt: (
          <VStack>
            <NumberInput
              min={0}
              max={state.data.game.debt}
              value={state.data.selection.amount}
              onChange={(amount) => state.send("CHANGED_AMOUNT", { amount })}
            />
            <Button
              onClick={() => state.send("PAID_LOAN", state.data.selection)}
            >
              Pay Debt
            </Button>
            <Button onClick={() => state.send("EXITED")}>Exit</Button>
          </VStack>
        ),
        paidOff: <VStack>Nice doin' business with you!</VStack>,
        canBorrow: (
          <VStack>
            <NumberInput
              min={0}
              value={state.data.selection.amount}
              onChange={(amount) => state.send("CHANGED_AMOUNT", { amount })}
            />
            <Button
              onClick={() => state.send("TOOK_LOAN", state.data.selection)}
            >
              Borrow
            </Button>
            <Button onClick={() => state.send("EXITED")}>Exit</Button>
          </VStack>
        ),
      })}
    </div>
  )
}

function BankScreen() {
  const state = useStateDesigner(game)
  return (
    <VStack>
      <NumberInput
        min={0}
        max={Math.max(state.data.coat.cash, state.data.game.bank)}
        value={state.data.selection.amount}
        onChange={(amount) => state.send("CHANGED_AMOUNT", { amount })}
      />
      <Button
        disabled={!state.can("DEPOSITED_CASH", state.data.selection)}
        onClick={() => state.send("DEPOSITED_CASH", { amount: 10 })}
      >
        Deposit
      </Button>
      <Button
        disabled={!state.can("WITHDREW_CASH", state.data.selection)}
        onClick={() => state.send("WITHDREW_CASH", state.data.selection)}
      >
        Withdraw
      </Button>
      <Button onClick={() => state.send("EXITED")}>Exit</Button>
    </VStack>
  )
}

function CityLinks() {
  const state = useStateDesigner(game)
  return (
    <VStack>
      <Heading size="md">Move To</Heading>
      {CitiesArr.map((city) => (
        <Button
          key={city.name}
          disabled={
            !state.can("MOVED") || city.name === state.data.game.city.name
          }
          onClick={() => state.send("MOVED", { name: city.name })}
        >
          {city.name} {city.name === state.data.coat.home && "(Home)"}
        </Button>
      ))}
    </VStack>
  )
}

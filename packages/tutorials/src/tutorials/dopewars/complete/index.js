import React from "react"
import { startCase } from "lodash"
import { Layout, HStack, VStack } from "components"
import { useStateDesigner } from "@state-designer/react"
import { transform } from "framer-motion"
import {
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Text,
  Heading,
  NumberInput,
  Button,
  Divider,
} from "@chakra-ui/core"
import game from "./game"
import { Cities, Drugs } from "./static"

export default function () {
  return (
    <Layout>
      <Stats />
      <Menu />
      <TravelLinks />
      {/* Modals */}
      <BuyModal />
      <SellModal />
      <BankModal />
      <LoanSharkModal />
      <SubwayModal />
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
      <Heading>{state.data.game.city.name}</Heading>
      <Divider />
    </>
  )
}

function TravelLinks() {
  const state = useStateDesigner(game)

  return (
    <VStack>
      <Heading size="md">Travel</Heading>
      <Button onClick={() => game.send("VISITED_SUBWAY")}>Enter Subway</Button>
      {state.isIn("home") && (
        <>
          <Button onClick={() => game.send("VISITED_BANK")}>Visit Bank</Button>
          <Button onClick={game.thenSend("VISITED_LOAN_SHARK")}>
            Visit Loan Shark
          </Button>
        </>
      )}
      <Divider />
    </VStack>
  )
}

function ModalModal({ children, isOpen, onClose, title }) {
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius={8} w="fit-content">
        <Layout>
          <HStack pb={5}>
            <Heading size="md">{title}</Heading>
            <ModalCloseButton />
          </HStack>
          <VStack>{children}</VStack>
        </Layout>
      </ModalContent>
    </Modal>
  )
}

function BuyModal() {
  const state = useStateDesigner(game)

  const { quantities } = state.values
  const { name, price, quantity } = state.data.selection

  return (
    <ModalModal
      title={`Buying ${startCase(name)}`}
      isOpen={state.isIn("buying")}
      onClose={state.thenSend("EXITED")}
    >
      <HStack width="100%" templateColumns="1fr 1fr auto">
        <Text>
          {startCase(name)} @ ${price?.toFixed()}
        </Text>
        <NumberInput
          sx={{ textAlign: "right" }}
          min={0}
          max={quantities[name]?.buy}
          value={quantity}
          onChange={(quantity) => state.send("CHANGED_QUANTITY", { quantity })}
        />
        <Button
          onClick={() =>
            state.send("CHANGED_QUANTITY", {
              quantity: quantities[name]?.buy,
            })
          }
        >
          Max
        </Button>
      </HStack>
      <HStack width="100%" templateColumns="1fr fit-content">
        <Text>Cash: ${state.data.coat.cash}</Text>
        <Text textAlign="right">Total: ${quantity * price}</Text>
      </HStack>
      <Button onClick={() => state.send("BOUGHT", { name, price, quantity })}>
        Buy
      </Button>
      <Button onClick={state.thenSend("EXITED")}>Cancel</Button>
    </ModalModal>
  )
}

function SellModal() {
  const state = useStateDesigner(game)

  const { quantities } = state.values
  const { name, price, quantity } = state.data.selection

  return (
    <ModalModal
      title={`Selling ${startCase(name)}`}
      isOpen={state.isIn("selling")}
      onClose={state.thenSend("EXITED")}
    >
      <HStack width="100%" templateColumns="1fr 1fr auto">
        <Text>
          {startCase(name)} @ ${price?.toFixed()}
        </Text>
        <NumberInput
          sx={{ textAlign: "right" }}
          min={0}
          max={quantities[name]?.sell}
          value={quantity}
          onChange={(quantity) => state.send("CHANGED_QUANTITY", { quantity })}
        />
        <Button
          onClick={() =>
            state.send("CHANGED_QUANTITY", {
              quantity: quantities[name]?.sell,
            })
          }
        >
          Max
        </Button>
      </HStack>
      <HStack width="100%" templateColumns="1fr fit-content">
        <Text>Cash: ${state.data.coat.cash}</Text>
        <Text textAlign="right">Total: ${quantity * price}</Text>
      </HStack>
      <Button onClick={() => state.send("SOLD", { name, price, quantity })}>
        Sell
      </Button>
      <Button onClick={state.thenSend("EXITED")}>Cancel</Button>
    </ModalModal>
  )
}

function Menu() {
  const state = useStateDesigner(game)
  const { colorMode } = useColorMode()
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
          const { minimum_price, maximum_price } = drug
          const price = state.data.game.city.prices[name]
          const quantity = state.data.coat.drugs[name]

          const normal =
            (price - minimum_price) / (maximum_price - minimum_price)

          const textColor =
            colorMode === "dark" ? "rgb(255,255,255)" : "rgb(0,0,0)"

          const color = transform(
            normal,
            [0, 0.5, 1],
            ["rgb(0, 128, 1)", textColor, "rgb(250, 3, 5)"]
          )

          return (
            <React.Fragment key={drug.name}>
              <Text>
                {drug.name} ({quantity})
              </Text>
              <Text
                style={{
                  textAlign: "right",
                  color,
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

function LoanSharkModal() {
  const state = useStateDesigner(game)
  const { amount } = state.data.selection

  return (
    <ModalModal
      title={`Loan Shark`}
      isOpen={state.isIn("loanshark")}
      onClose={state.thenSend("EXITED")}
    >
      {state.whenIn({
        inDebt: (
          <>
            <NumberInput
              min={0}
              max={state.data.game.debt}
              value={amount}
              onChange={(amount) => state.send("CHANGED_AMOUNT", { amount })}
            />
            <Button
              onClick={() =>
                state.send("CHANGED_AMOUNT", {
                  amount: Math.min(state.data.coat.cash, state.data.game.debt),
                })
              }
            >
              Max
            </Button>
            <Button onClick={() => state.send("PAID_LOAN", { amount })}>
              Pay Debt
            </Button>
            <Button onClick={state.thenSend("EXITED")}>Exit</Button>
          </>
        ),
        paidOff: "Nice doin' business with you!",
        canBorrow: (
          <>
            <NumberInput
              min={0}
              value={amount}
              onChange={(amount) => state.send("CHANGED_AMOUNT", { amount })}
            />
            <Button onClick={() => state.send("TOOK_LOAN", { amount })}>
              Borrow
            </Button>
            <Button onClick={state.thenSend("EXITED")}>Exit</Button>
          </>
        ),
      })}
    </ModalModal>
  )
}

function BankModal() {
  const state = useStateDesigner(game)
  const { amount } = state.data.selection

  return (
    <ModalModal
      title={`Bank`}
      isOpen={state.isIn("bank")}
      onClose={state.thenSend("EXITED")}
    >
      <NumberInput
        min={0}
        max={Math.max(state.data.coat.cash, state.data.game.bank)}
        value={amount}
        onChange={(amount) => state.send("CHANGED_AMOUNT", { amount })}
      />
      <Button
        disabled={!state.can("DEPOSITED_CASH", { amount })}
        onClick={() => state.send("DEPOSITED_CASH", { amount })}
      >
        Deposit
      </Button>
      <Button
        disabled={!state.can("WITHDREW_CASH", { amount: Math.max(1, amount) })}
        onClick={() => state.send("WITHDREW_CASH", { amount })}
      >
        Withdraw
      </Button>
      <Button
        disabled={!state.can("WITHDREW_CASH", { amount: 1 })}
        onClick={() =>
          state.send("CHANGED_AMOUNT", {
            amount: state.data.game.bank,
          })
        }
      >
        Max
      </Button>
      <Button onClick={state.thenSend("EXITED")}>Exit</Button>
    </ModalModal>
  )
}

function SubwayModal() {
  const state = useStateDesigner(game)
  return (
    <ModalModal
      title={state.isIn("subway.selecting") ? `Subway` : "Traveling..."}
      isOpen={state.isIn("subway")}
      onClose={state.thenSend("EXITED")}
    >
      {Object.values(Cities).map((city) => (
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
    </ModalModal>
  )
}

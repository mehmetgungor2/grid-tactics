import { useEffect, useState } from "react"
import "./App.css"

const GRID_SIZE = 10

export default function App() {

  const [mode, setMode] = useState(null)

  const [player, setPlayer] = useState({
    x: 0,
    y: 0
  })

  const [resource, setResource] = useState({
    x: 5,
    y: 5
  })

  const [score, setScore] = useState(0)

  const [enemies, setEnemies] = useState([
    { x: 9, y: 9 }
  ])

  const [timeLeft, setTimeLeft] = useState(120)

  const [gameOver, setGameOver] = useState(false)

  const [win, setWin] = useState(false)

  // START GAME
  const startNewGame = () => {

    setPlayer({
      x: 0,
      y: 0
    })

    setResource({
      x: 5,
      y: 5
    })

    setScore(0)

    setEnemies([
      { x: 9, y: 9 }
    ])

    setTimeLeft(120)

    setGameOver(false)

    setWin(false)
  }

  // MENU
  const goToMenu = () => {

    startNewGame()

    setMode(null)
  }

  // MOVE ENEMIES
  const moveEnemies = () => {

    setEnemies((prevEnemies) => {

      return prevEnemies.map((enemy) => {

        let newX = enemy.x
        let newY = enemy.y

        const moveHorizontal =
          Math.random() > 0.5

        if (moveHorizontal) {

          if (player.x > enemy.x) newX++
          else if (player.x < enemy.x) newX--

        } else {

          if (player.y > enemy.y) newY++
          else if (player.y < enemy.y) newY--

        }

        return {
          x: newX,
          y: newY
        }
      })
    })
  }

  // PLAYER MOVEMENT
  useEffect(() => {

    if (!mode || gameOver || win) return

    const handleKeyDown = (e) => {

      const key = e.key.toLowerCase()

      if (
        key !== "w" &&
        key !== "a" &&
        key !== "s" &&
        key !== "d"
      ) return

      e.preventDefault()

      setPlayer((prev) => {

        let newX = prev.x
        let newY = prev.y

        if (key === "w") newY--
        if (key === "s") newY++
        if (key === "a") newX--
        if (key === "d") newX++

        newX = Math.max(
          0,
          Math.min(GRID_SIZE - 1, newX)
        )

        newY = Math.max(
          0,
          Math.min(GRID_SIZE - 1, newY)
        )

        // COLLECT RESOURCE
        if (
          newX === resource.x &&
          newY === resource.y
        ) {

          setScore((prev) => prev + 1)

          let randomX
          let randomY

          do {

            randomX = Math.floor(
              Math.random() * GRID_SIZE
            )

            randomY = Math.floor(
              Math.random() * GRID_SIZE
            )

          } while (
            randomX === newX &&
            randomY === newY
          )

          setResource({
            x: randomX,
            y: randomY
          })
        }

        return {
          x: newX,
          y: newY
        }
      })

      // MOVE ENEMIES WHEN PLAYER MOVES
      moveEnemies()
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }

  }, [resource, mode, gameOver, win, player])

  // AUTO ENEMY MOVEMENT
  useEffect(() => {

    if (!mode || gameOver || win) return

    const interval = setInterval(() => {

      moveEnemies()

    }, 450)

    return () => clearInterval(interval)

  }, [mode, gameOver, win, player])

  // COLLISION
  useEffect(() => {

    enemies.forEach((enemy) => {

      if (
        enemy.x === player.x &&
        enemy.y === player.y
      ) {

        setGameOver(true)
      }
    })

  }, [player, enemies])

  // TIMER
  useEffect(() => {

    if (!mode || gameOver || win) return

    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {

          setWin(true)

          clearInterval(timer)

          return 0
        }

        return prev - 1
      })

    }, 1000)

    return () => clearInterval(timer)

  }, [mode, gameOver, win])

  // ADD ENEMIES
  useEffect(() => {

    if (
      timeLeft === 90 ||
      timeLeft === 60 ||
      timeLeft === 30
    ) {

      setEnemies((prev) => [
        ...prev,
        {
          x: Math.floor(
            Math.random() * GRID_SIZE
          ),
          y: Math.floor(
            Math.random() * GRID_SIZE
          )
        }
      ])
    }

  }, [timeLeft])

  // GRID
  const grid = []

  for (let y = 0; y < GRID_SIZE; y++) {

    for (let x = 0; x < GRID_SIZE; x++) {

      const isPlayer =
        player.x === x &&
        player.y === y

      const isResource =
        resource.x === x &&
        resource.y === y

      const isEnemy = enemies.some(
        (enemy) =>
          enemy.x === x &&
          enemy.y === y
      )

      grid.push(
        <div
          key={`${x}-${y}`}
          className={`
            cell
            ${isPlayer ? "player" : ""}
            ${isResource ? "resource" : ""}
            ${isEnemy ? "enemy" : ""}
          `}
        ></div>
      )
    }
  }

  // MENU SCREEN
  if (!mode) {

    return (
      <div className="menu">

        <h1 className="title">
          GRID TACTICS
        </h1>

        <p className="info">
          Use WASD to move
        </p>

        <div className="mode-card">

          <h2>Collect Mode</h2>

          <p>
            Collect yellow energy cubes
            while escaping enemies.
            Earn as many points as possible.
          </p>

          <button
            onClick={() => setMode("collect")}
          >
            Play Collect Mode
          </button>

        </div>

        <div className="mode-card">

          <h2>Survival Mode</h2>

          <p>
            Survive for 2 minutes while
            enemies increase over time.
            Do not get caught.
          </p>

          <button
            onClick={() => setMode("survival")}
          >
            Play Survival Mode
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="container">

      <h1>Grid Tactics</h1>

      <div className="stats">

        <h2>Score: {score}</h2>

        <h2>Time: {timeLeft}</h2>

      </div>

      <div className="grid">
        {grid}
      </div>

      {gameOver && (

        <div className="fullscreen-overlay">

          <h1 className="game-over">
            GAME OVER
          </h1>

          <div className="overlay-buttons">

            <button
              onClick={startNewGame}
            >
              Retry
            </button>

            <button
              onClick={goToMenu}
            >
              Main Menu
            </button>

          </div>

        </div>
      )}

      {win && (

        <div className="fullscreen-overlay">

          <h1 className="win">
            YOU SURVIVED
          </h1>

          <div className="overlay-buttons">

            <button
              onClick={startNewGame}
            >
              Play Again
            </button>

            <button
              onClick={goToMenu}
            >
              Main Menu
            </button>

          </div>

        </div>
      )}

    </div>
  )
}
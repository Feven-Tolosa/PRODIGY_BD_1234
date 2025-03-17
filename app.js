const express = require('express')
const redis = require('redis')
const app = express()
const port = 3000

// Create a Redis client
const client = redis.createClient()

client.on('error', (err) => {
  console.error('Redis error:', err)
})

// Simulate a database query
function getUsersFromDB() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ])
    }, 2000) // Simulate a 2-second delay
  })
}

app.get('/users', async (req, res) => {
  try {
    // Check the Redis cache
    client.get('users', async (err, data) => {
      if (err) throw err

      if (data) {
        // If data is in the cache, return it
        res.json(JSON.parse(data))
      } else {
        // If not, fetch from the database
        const users = await getUsersFromDB()
        // Store the data in the cache with a 30-second expiration
        client.setex('users', 30, JSON.stringify(users))
        res.json(users)
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.put('/users/:id', (req, res) => {
  // Update user logic here
  // Invalidate the cache
  client.del('users', (err) => {
    if (err) throw err
    res.json({ status: 'success' })
  })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

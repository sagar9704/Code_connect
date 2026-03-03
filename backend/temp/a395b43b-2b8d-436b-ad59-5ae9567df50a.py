import random

# Simple number guessing game
number = random.randint(1, 10)

try:
    guess = int(input("Guess a number between 1 and 10: "))
    if guess == number:
        print("🎉 Correct!")
    else:
        print(f"❌ Wrong! The number was {number}")
except ValueError:
    print("Please enter a valid integer.")
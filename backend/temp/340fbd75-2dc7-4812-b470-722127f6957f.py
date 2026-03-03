import math

# Calculate area of a circle
try:
    radius = float(input("Enter radius: "))
    if radius < 0:
        raise ValueError("Radius cannot be negative.")
    area = math.pi * math.pow(radius, 2)
    print(f"Area of circle: {area:.2f}")
except ValueError as e:
    print("Invalid input:", e)
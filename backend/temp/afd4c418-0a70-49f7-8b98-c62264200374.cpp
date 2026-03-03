#include <iostream>
#include <cstdlib> // for abs()

using namespace std;

// Function to calculate GCD using Euclidean algorithm
int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return abs(a); // Ensure GCD is always positive
}

// Function to calculate LCM
int lcm(int a, int b) {
    if (a == 0 || b == 0) {
        return 0; // LCM involving zero is zero
    }
    return abs(a * b) / gcd(a, b);
}

int main() {
    int num1, num2;

    cout << "Enter two integers: ";
    if (!(cin >> num1 >> num2)) { // Input validation
        cerr << "Invalid input. Please enter integers only." << endl;
        return 1;
    }

    int result = lcm(num1, num2);
    cout << "LCM of " << num1 << " and " << num2 << " is: " << result << endl;

    return 0;
}
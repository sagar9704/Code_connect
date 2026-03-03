#include <stdio.h>

int main() {
    // Declare integer variables
    int num1, num2, sum;

    // Prompt the user for the first number
    printf("Enter the first integer: ");
    
    // Read the first integer from the user
    // The '%d' format specifier is for integers, and '&num1' is the address of the variable
    scanf("%d", &num1); 

    // Prompt the user for the second number
    printf("Enter the second integer: ");
    scanf("%d", &num2);

    // Calculate the sum
    sum = num1 + num2;

    // Display the result
    printf("The sum of %d and %d is: %d\n", num1, num2, sum);

    return 0;
}
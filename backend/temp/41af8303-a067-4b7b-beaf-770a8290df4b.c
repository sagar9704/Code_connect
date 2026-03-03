#include <stdio.h>

int main() {
    double x, y;

    printf("Enter two numbers: ");
    scanf("%lf %lf", &x, &y);

    printf("Sum = %.2lf\n", x + y);
    printf("Difference = %.2lf\n", x - y);
    printf("Product = %.2lf\n", x * y);

    if (y != 0)
        printf("Quotient = %.2lf\n", x / y);
    else
        printf("Cannot divide by zero\n");

    return 0;
}

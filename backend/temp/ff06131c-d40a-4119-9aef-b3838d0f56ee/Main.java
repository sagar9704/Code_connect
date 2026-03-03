import java.util.Scanner;

public class CalculateSquare {
    public static void main(String[] args) {
        // Create a Scanner object to read input from the console
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("--- Integer Square Calculator ---");
        System.out.print("Enter an integer: ");
        
        // Check if the input is actually an integer
        if (scanner.hasNextInt()) {
            int number = scanner.nextInt();
            
            // Calculate the square of the number
            long square = (long) number * number;
            
            // Print the result
            System.out.println("The integer you entered is: " + number);
            System.out.println("The square of " + number + " is: " + square);
        } else {
            System.out.println("Invalid input. Please enter a valid integer.");
        }
        
        // Close the scanner object to free up system resources
        scanner.close();
    }
}
import java.util.Scanner;

public class PrintInteger {
    public static void main(String args[]) {
        // 1. Create a Scanner object for reading input from the console
        Scanner sc = new Scanner(System.in);
        
        // 2. Prompt the user to enter an integer
        System.out.println("Enter an integer:");
        
        // 3. Read the integer input from the user
        int num = sc.nextInt();
        
        // 4. Print the received integer back to the user
        System.out.print("Given integer is :: " + num);
        
        // 5. Close the scanner object to release system resources (good practice)
        sc.close();
    }
}
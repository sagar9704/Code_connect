#include <iostream>

// Define the Rectangle Class
class Rectangle {
private:
    // Data members (attributes)
    double length;
    double width;

public:
    // Constructor to initialize length and width
    Rectangle(double l, double w) {
        // Simple input validation to ensure positive dimensions
        length = (l > 0) ? l : 1.0;
        width = (w > 0) ? w : 1.0;
    }

    // Method to calculate the area
    double calculateArea() const {
        return length * width;
    }

    // Method to calculate the perimeter
    double calculatePerimeter() const {
        return 2 * (length + width);
    }
    
    // Getter method to display dimensions
    void displayDimensions() const {
        std::cout << "Dimensions: " << length << " x " << width << std::endl;
    }
};

int main() {
    // 1. Create the first Rectangle object
    Rectangle rect1(10.5, 5.2);
    
    std::cout << "--- Rectangle 1 ---" << std::endl;
    rect1.displayDimensions();
    std::cout << "Area: " << rect1.calculateArea() << std::endl;
    std::cout << "Perimeter: " << rect1.calculatePerimeter() << std::endl;
    
    std::cout << "\n";
    
    // 2. Create a second Rectangle object
    Rectangle rect2(7.0, 7.0); // A square is a type of rectangle
    
    std::cout << "--- Rectangle 2 (Square) ---" << std::endl;
    rect2.displayDimensions();
    std::cout << "Area: " << rect2.calculateArea() << std::endl;
    std::cout << "Perimeter: " << rect2.calculatePerimeter() << std::endl;

    return 0;
}
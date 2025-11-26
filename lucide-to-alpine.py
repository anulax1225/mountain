import os
from pathlib import Path
from bs4 import BeautifulSoup
from bs4.formatter import HTMLFormatter

def process_svg_files(input_folder, output_folder="output"):
    input_path = Path(input_folder)
    output_path = Path(output_folder)
    
    output_path.mkdir(exist_ok=True)
    
    for svg_file in input_path.glob("*.svg"):
        with open(svg_file, 'r', encoding='utf-8') as f:
            content = f.read()
        wrapped_content = f"<template unwrap>{content}</template>"
        soup = BeautifulSoup(wrapped_content, 'html.parser')
        formatter = HTMLFormatter(indent=4, empty_attributes_are_booleans=True)
        formatted_html = soup.prettify(formatter=formatter)
        
        output_file = output_path / f"{svg_file.stem}.alpine.html"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(formatted_html)
        
        print(f"Processed: {svg_file.name} -> {output_file.name}")

if __name__ == "__main__":
    input_folder = "icons"
    output_folder = "lucide-moutain-next" 
    
    process_svg_files(input_folder, output_folder)
import Foundation
import Vision
import AppKit

if CommandLine.arguments.count < 2 {
    fputs("usage: vision_ocr.swift image...\n", stderr)
    exit(2)
}

func recognize(_ path: String) throws {
    guard let image = NSImage(contentsOfFile: path),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        throw NSError(domain: "ocr", code: 1, userInfo: [NSLocalizedDescriptionKey: "Cannot load \(path)"])
    }

    let request = VNRecognizeTextRequest()
    request.revision = VNRecognizeTextRequestRevision3
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false
    let preferredLanguages = ["zh-Hant", "zh-Hans", "en-US"]
    let supported = (try? request.supportedRecognitionLanguages()) ?? []
    fputs("supported languages: \(supported.joined(separator: ","))\n", stderr)
    let usable = preferredLanguages.filter { supported.contains($0) }
    request.recognitionLanguages = usable.isEmpty ? supported : usable
    request.minimumTextHeight = 0.006

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try handler.perform([request])

    print("=== \(path) ===")
    let results = (request.results ?? []).compactMap { obs -> (String, CGRect, Float)? in
        guard let candidate = obs.topCandidates(1).first else { return nil }
        return (candidate.string, obs.boundingBox, candidate.confidence)
    }
    for (text, box, confidence) in results {
        let x = String(format: "%.4f", box.origin.x)
        let y = String(format: "%.4f", box.origin.y)
        let w = String(format: "%.4f", box.size.width)
        let h = String(format: "%.4f", box.size.height)
        let c = String(format: "%.2f", confidence)
        print("\(x)\t\(y)\t\(w)\t\(h)\t\(c)\t\(text)")
    }
}

for path in CommandLine.arguments.dropFirst() {
    do {
        try recognize(path)
    } catch {
        fputs("\(path): \(error)\n", stderr)
    }
}

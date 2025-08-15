import Foundation
import Network
import NitroModules

final class HybridUdp: HybridUdpSpec {
  private var connection: NWConnection?
  private let connectionQueue = DispatchQueue(label: "com.margelo.nitro.udp.connection")
  private var receiveCallback: ((ArrayBuffer) -> Void)?
  private var isReceiving: Bool = false

  private func log(_ message: String) {
    print("[HybridUdp] \(message)")
  }

  public func initialize(host: String, port: Double) throws -> Void {
    log("init(host: \(host), port: \(port)) called")
    // Close any existing connection first
    if let existing = connection {
      log("Cancelling existing connection before re-init")
      existing.cancel()
      connection = nil
    }

    guard port >= 0 && port <= 65535, let nwPort = NWEndpoint.Port(rawValue: UInt16(port)) else {
      throw NSError(domain: "HybridUdp", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid port: \(port)"])
    }

    let endpoint = NWEndpoint.hostPort(host: NWEndpoint.Host(host), port: nwPort)
    let parameters = NWParameters.udp
    let conn = NWConnection(to: endpoint, using: parameters)
    connection = conn

    conn.stateUpdateHandler = { [weak self] state in
      self?.log("Connection state changed: \(state)")
      switch state {
      case .ready:
        self?.log("Connection ready — starting receiver if needed")
        self?.startReceivingIfNeeded()
      case .failed(let error):
        self?.log("Connection failed: \(error.localizedDescription)")
        self?.isReceiving = false
        self?.connection = nil
      case .cancelled:
        self?.log("Connection cancelled")
        self?.isReceiving = false
        self?.connection = nil
      default:
        break
      }
    }

    log("Starting connection on background queue")
    conn.start(queue: connectionQueue)
  }

  public func send(data: ArrayBuffer) throws -> Void {
    guard let connection = connection else {
      throw NSError(domain: "HybridUdp", code: 2, userInfo: [NSLocalizedDescriptionKey: "UDP connection not initialized. Call init(host:port:) first."])
    }
    
    // Convert ArrayBuffer to Data for Network framework
    // ArrayBuffer should have a way to access its underlying data
    // For now, we'll need to create a proper conversion method
    let payload = convertArrayBufferToData(data)
    log("Sending \(payload.count) bytes")
    connection.send(content: payload, completion: .contentProcessed { [weak self] error in
      if let error = error {
        self?.log("Send completion with error: \(error.localizedDescription)")
      } else {
        self?.log("Send completion success")
      }
    })
  }

  public func onReceive(callback: @escaping (_ data: ArrayBuffer) -> Void) throws -> Void {
    receiveCallback = callback
    log("onReceive registered — starting receiver if needed")
    startReceivingIfNeeded()
  }

  public func close() throws -> Void {
    log("close() called")
    isReceiving = false
    receiveCallback = nil
    if let connection = connection {
       log("Cancelling connection on close()")
      connection.cancel()
      self.connection = nil
    }
  }

  private func startReceivingIfNeeded() {
    guard !isReceiving, let connection = connection else {
      if isReceiving {
        log("startReceivingIfNeeded skipped — already receiving")
      } else {
        log("startReceivingIfNeeded skipped — connection nil")
      }
      return
    }
    log("Starting receive loop")
    isReceiving = true
    receiveNext(on: connection)
  }

  private func receiveNext(on connection: NWConnection) {
    connection.receiveMessage { [weak self] data, context, isComplete, error in
      guard let self else { return }
      defer {
        if error == nil && self.connection === connection {
          self.receiveNext(on: connection)
        } else {
          self.isReceiving = false
        }
      }

      if let error = error {
        self.log("Receive error: \(error.localizedDescription)")
      }

      guard let data = data, !data.isEmpty else {
        self.log("Received empty payload")
        return
      }

      self.log("Received \(data.count) bytes (isComplete=\(isComplete), context=\(String(describing: context)))")

      // Convert Data to ArrayBuffer and deliver directly
      let arrayBuffer = convertDataToArrayBuffer(data)
      self.log("Delivering \(data.count) bytes as ArrayBuffer")
      self.receiveCallback?(arrayBuffer)
    }
  }
  
  // Helper methods for ArrayBuffer conversion
  private func convertArrayBufferToData(_ arrayBuffer: ArrayBuffer) -> Data {
    // Convert ArrayBuffer to Data using the toData method
    // We need to copy the data since we're passing it to Network framework
    return arrayBuffer.toData(copyIfNeeded: true)
  }
  
  private func convertDataToArrayBuffer(_ data: Data) -> ArrayBuffer {
    // Convert Data to ArrayBuffer using the copy method
    do {
      return try ArrayBuffer.copy(data: data)
    } catch {
      log("Error converting Data to ArrayBuffer: \(error)")
      // Return an empty ArrayBuffer as fallback
      return ArrayBuffer.allocate(size: 0)
    }
  }
}
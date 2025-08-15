package com.margelo.nitro.udp

import android.util.Log
import android.util.Base64
import java.io.IOException
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.SocketException
import java.nio.charset.Charset
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicBoolean
import com.margelo.nitro.core.ArrayBuffer
import com.margelo.nitro.core.HybridObject

class HybridUdp : HybridUdpSpec() {
  private var socket: DatagramSocket? = null
  private var remoteAddress: InetAddress? = null
  private var remotePort: Int = -1

  private var receiveCallback: ((ArrayBuffer) -> Unit)? = null
  private val isReceiving = AtomicBoolean(false)
  private var receiveThread: Thread? = null

  private fun log(message: String) {
    Log.d("HybridUdp", message)
  }

  override fun initialize(host: String, port: Double) {
    log("init(host=$host, port=$port) called")

    // Close any existing socket first
    closeInternal()

    val intPort = port.toInt()
    if (port < 0.0 || port > 65535.0 || intPort.toDouble() != port) {
      throw IllegalArgumentException("Invalid port: $port")
    }

    try {
      val address = InetAddress.getByName(host)
      val udpSocket = DatagramSocket()
      // Connect to restrict receive() to the given endpoint and simplify send()
      udpSocket.connect(address, intPort)

      socket = udpSocket
      remoteAddress = address
      remotePort = intPort

      log("Socket created and connected to ${address.hostAddress}:$intPort — starting receiver if needed")
      startReceivingIfNeeded()
    } catch (e: Exception) {
      // Ensure cleanup on failure
      closeInternal()
      throw e
    }
  }

  override fun send(data: ArrayBuffer) {
    val currentSocket = socket ?: throw IllegalStateException(
      "UDP connection not initialized. Call initialize(host, port) first."
    )
    val address = remoteAddress
    val port = remotePort
    if (address == null || port < 0) {
      throw IllegalStateException("UDP connection not initialized correctly.")
    }

    // Use ArrayBuffer.getBuffer() to get a ByteBuffer, then convert to ByteArray
    val byteBuffer = data.getBuffer(copyIfNeeded = true)
    val payload = ByteArray(byteBuffer.remaining())
    byteBuffer.get(payload)
    
    log("Sending ${payload.size} bytes")
    try {
      val packet = DatagramPacket(payload, payload.size, address, port)
      currentSocket.send(packet)
    } catch (e: IOException) {
      log("Send error: ${e.message}")
      throw e
    }
  }

  override fun onReceive(callback: (data: ArrayBuffer) -> Unit) {
    receiveCallback = callback
    log("onReceive registered — starting receiver if needed")
    startReceivingIfNeeded()
  }

  override fun close() {
    log("close() called")
    closeInternal()
  }

  private fun startReceivingIfNeeded() {
    val currentSocket = socket
    if (currentSocket == null) {
      log("startReceivingIfNeeded skipped — socket is null")
      return
    }
    if (isReceiving.get()) {
      log("startReceivingIfNeeded skipped — already receiving")
      return
    }

    isReceiving.set(true)
    val thread = Thread({ receiveLoop(currentSocket) }, "HybridUdp-Receiver")
    receiveThread = thread
    log("Starting receive loop thread")
    thread.start()
  }

  private fun receiveLoop(currentSocket: DatagramSocket) {
    val buffer = ByteArray(64 * 1024) // Max UDP packet size
    while (isReceiving.get()) {
      try {
        val packet = DatagramPacket(buffer, buffer.size)
        currentSocket.receive(packet) // blocking

        if (!isReceiving.get()) break

        val length = packet.length
        if (length <= 0) {
          log("Received empty payload")
          continue
        }

        val dataBytes = packet.data.copyOfRange(packet.offset, packet.offset + length)
        // Convert ByteArray to ArrayBuffer using ByteBuffer
        val byteBuffer = ByteBuffer.wrap(dataBytes)
        val arrayBuffer = ArrayBuffer.copy(byteBuffer)

        log("Received $length bytes")
        receiveCallback?.invoke(arrayBuffer)
      } catch (e: SocketException) {
        // Expected when socket is closed, exit loop gracefully
        log("Receive loop SocketException: ${e.message}")
        break
      } catch (e: IOException) {
        log("Receive loop IOException: ${e.message}")
        // Continue loop unless we're shutting down
        if (!isReceiving.get()) break
      } catch (e: Throwable) {
        log("Receive loop error: ${e.message}")
        if (!isReceiving.get()) break
      }
    }
    isReceiving.set(false)
  }

  private fun closeInternal() {
    isReceiving.set(false)
    receiveCallback = null

    // Closing the socket will unblock any pending receive()
    try {
      socket?.close()
    } catch (_: Throwable) {
      // ignore
    }
    socket = null
    remoteAddress = null
    remotePort = -1

    // Interrupt and join receive thread
    receiveThread?.let { thread ->
      try {
        thread.interrupt()
        thread.join(200)
      } catch (_: InterruptedException) {
      }
    }
    receiveThread = null
  }
}
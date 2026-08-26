require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name             = 'OnlySignatureNative'
  s.version          = package['version']
  s.summary          = package['description']
  s.description      = package['description']
  s.license          = package['license']
  s.author           = package['author']
  s.homepage         = package['homepage']
  s.platforms        = { :ios => '16.4' }
  s.swift_version    = '5.9'
  # Expo autolinking installs this private module from its checked-in path.
  # The public product URL is metadata, not a remote runtime dependency.
  s.source           = { http: 'https://onlysignature.app/' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
  s.resource_bundles = {
    'OnlySignatureNative_privacy' => ['PrivacyInfo.xcprivacy']
  }
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end

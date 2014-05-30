#include <v8.h>
#include <node.h>

using namespace v8;
using namespace node;

namespace ethereum {

	class Key : ObjectWrap
	{
		private:
			void Generate();
		public:
			static Key* New();
			static Handle<Value> New(const Arguments& args);
			static Handle<Value> GenerateSync(const Arguments& args);
			static Handle<Value> GetPrivate(Local<String> property, const AccessorInfo& info);
			static void SetPrivate(Local<String> property, Local<Value> value, const AccessorInfo& info);
			static Handle<Value> GetPublic(Local<String> property, const AccessorInfo& info);
			static void SetPublic(Local<String> property, Local<Value> value, const AccessorInfo& info);
	};
};